import * as React from 'react';
import { profile } from './profile';
import styles from './personal.module.css';

// Posts to /api/contact, which emails the message through Resend. The chosen topic sets the email subject.

type Status = 'idle' | 'sending' | 'sent' | 'error';

export default function ContactForm() {
    const topics = profile.contactTopics;
    const [topic, setTopic] = React.useState(topics[0]);
    const [status, setStatus] = React.useState<Status>('idle');

    async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        const form = e.currentTarget;
        const data = Object.fromEntries(new FormData(form));
        setStatus('sending');
        try {
            const response = await fetch('/api/contact', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            if (!response.ok) throw new Error(String(response.status));
            form.reset();
            setTopic(topics[0]);
            setStatus('sent');
        } catch {
            setStatus('error');
        }
    }

    if (status === 'sent') {
        return (
            <div className={styles.formDone} role="status">
                <p className={styles.formDoneTitle}>
                    Thank you. <em>Message received.</em>
                </p>
                <p>I’ll get back to you soon.</p>
                <button type="button" className={styles.formLink} onClick={() => setStatus('idle')}>
                    Send another message
                </button>
            </div>
        );
    }

    return (
        <form name="contact" method="POST" className={styles.form} onSubmit={onSubmit}>
            <p className={styles.honeypot}>
                <label>
                    Leave this empty <input name="bot-field" tabIndex={-1} autoComplete="off" />
                </label>
            </p>

            <fieldset className={styles.topics}>
                <legend>What is it about?</legend>
                {topics.map((item) => (
                    <label key={item.value} className={styles.topic}>
                        <input type="radio" name="topic" value={item.value} checked={topic.value === item.value} onChange={() => setTopic(item)} />
                        <span>{item.label}</span>
                    </label>
                ))}
            </fieldset>

            <div className={styles.fields}>
                <label className={styles.field}>
                    <span>Name</span>
                    <input name="name" required autoComplete="name" />
                </label>
                <label className={styles.field}>
                    <span>Email</span>
                    <input name="email" type="email" required autoComplete="email" />
                </label>
                <label className={styles.field}>
                    <span>Company or organisation</span>
                    <input name="company" autoComplete="organization" />
                </label>
                {topic.event && (
                    <label className={styles.field}>
                        <span>Date and place</span>
                        <input name="when" placeholder="e.g. 12 March, Lisbon" />
                    </label>
                )}
                <label className={`${styles.field} ${styles.fieldWide}`}>
                    <span>Message</span>
                    <textarea name="message" required rows={4} placeholder={topic.prompt} />
                </label>
            </div>

            <div className={styles.formFoot}>
                <button type="submit" className={styles.submit} disabled={status === 'sending'} data-cursor="Send">
                    {status === 'sending' ? 'Sending…' : 'Send message'}
                    <span aria-hidden="true">→</span>
                </button>
                {status === 'error' && (
                    <p className={styles.formError} role="alert">
                        Something went wrong. Please try again, or reach me on{' '}
                        <a href={profile.links.linkedin} target="_blank" rel="noreferrer">
                            LinkedIn
                        </a>
                        .
                    </p>
                )}
            </div>
        </form>
    );
}
