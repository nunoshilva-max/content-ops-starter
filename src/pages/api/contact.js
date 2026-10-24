import { profile } from '../../components/personal/profile';

// Sends contact form messages from nuno-silva.com by email through the Resend API.
// Configure in Netlify (Project configuration → Environment variables):
//   RESEND_API_KEY     API key from resend.com
//   CONTACT_TO_EMAIL   where messages are delivered
//   CONTACT_FROM_EMAIL optional sender; defaults to Resend's test sender, which can only
//                      deliver to the Resend account's own email until a domain is verified
const DEFAULT_FROM = 'nuno-silva.com <onboarding@resend.dev>';
const LIMITS = { name: 120, email: 200, company: 160, when: 160, message: 5000 };
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function field(body, name) {
    const value = typeof body[name] === 'string' ? body[name].trim() : '';
    return value.slice(0, LIMITS[name]);
}

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        res.setHeader('Allow', 'POST');
        return res.status(405).send({ error: 'method not allowed' });
    }

    const body = req.body || {};
    // Bots fill the hidden honeypot field; pretend it worked.
    if (body['bot-field']) {
        return res.status(200).send({ ok: true });
    }

    const topic = profile.contactTopics.find((item) => item.value === body.topic) || profile.contactTopics[0];
    const name = field(body, 'name');
    const email = field(body, 'email');
    const company = field(body, 'company');
    const when = field(body, 'when');
    const message = field(body, 'message');
    if (!name || !message || !EMAIL_PATTERN.test(email)) {
        return res.status(400).send({ error: 'name, a valid email and a message are required' });
    }

    const apiKey = process.env.RESEND_API_KEY;
    const to = process.env.CONTACT_TO_EMAIL;
    if (!apiKey || !to) {
        console.error('contact: RESEND_API_KEY or CONTACT_TO_EMAIL is not set');
        return res.status(500).send({ error: 'contact form is not configured' });
    }

    const details = [
        `Topic: ${topic.label}`,
        `Name: ${name}`,
        `Email: ${email}`,
        company && `Company: ${company}`,
        when && `Date and place: ${when}`
    ].filter(Boolean);
    const text = `${details.join('\n')}\n\n${message}`;

    try {
        const response = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({
                from: process.env.CONTACT_FROM_EMAIL || DEFAULT_FROM,
                to: [to],
                reply_to: email,
                subject: `nuno-silva.com — ${topic.subject} — ${name}`,
                text
            })
        });
        if (!response.ok) {
            console.error('contact: Resend responded', response.status, await response.text());
            return res.status(502).send({ error: 'could not send the message' });
        }
        return res.status(200).send({ ok: true });
    } catch (error) {
        console.error('contact: request to Resend failed', error);
        return res.status(502).send({ error: 'could not send the message' });
    }
}
