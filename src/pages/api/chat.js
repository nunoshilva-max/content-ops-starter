import Anthropic from '@anthropic-ai/sdk';

const MODEL = 'claude-opus-5-5';
const MAX_HISTORY = 40;
const MAX_MESSAGE_LENGTH = 4000;
// The server-side search loop can pause long turns; resume it at most this many times.
const MAX_CONTINUATIONS = 3;
const MAX_SOURCES = 5;

// Public sources the assistant may search: Banco Best and Banco de Portugal
// (bportugal.pt also covers subdomains such as clientebancario.bportugal.pt).
const SEARCH_DOMAINS = (process.env.CHAT_SEARCH_DOMAINS || 'bancobest.pt,bportugal.pt')
    .split(',')
    .map((domain) => domain.trim())
    .filter(Boolean);

const DEFAULT_SYSTEM_PROMPT = `You are the banking assistant in the chat window of this website. You help people in Portugal with questions about Banco Best's products and services, and with general banking topics as explained by Banco de Portugal.

Sources
- Base your answers on public information from Banco Best (bancobest.pt) and Banco de Portugal (bportugal.pt, including the Portal do Cliente Bancário at clientebancario.bportugal.pt). Use web search to check these sites whenever the answer depends on specifics: products, conditions, fees and the price list (preçário), interest rates, opening hours, contacts, regulations or customer rights.
- Never invent figures, rates, fees, phone numbers or procedures. If you can't find something in those sources, say so and point the person to the relevant official page or channel.
- Conditions and prices change, so mention that figures should be confirmed on the official price list or with the bank before deciding.

Boundaries
- You are an information assistant, not an official channel of Banco Best or Banco de Portugal. You can't see accounts, make transactions, open products or handle complaints; explain how to do those through the official channels instead.
- Never ask for passwords, access codes, card numbers, PINs, CVV, one-time SMS codes or other credentials. If someone shares one, tell them not to share it with anyone and, if they think it may be compromised, to contact the bank through its official channels straight away.
- Give general information, not personalised financial or investment advice. For decisions about specific products, suggest speaking with the bank or an adviser.
- For suspected fraud, lost or stolen cards, or other urgent issues, point to the bank's official emergency contacts (found on its website) first.
- Stay on banking and personal-finance topics; politely decline unrelated requests.

Style
- Reply in the language the person writes in; default to European Portuguese.
- Keep answers short and clear, as in a chat. Use Markdown lists only when they help.`;

const SYSTEM_PROMPT = process.env.CHAT_SYSTEM_PROMPT || DEFAULT_SYSTEM_PROMPT;

const TOOLS = [
    {
        type: 'web_search_20260209',
        name: 'web_search',
        max_uses: 5,
        allowed_domains: SEARCH_DOMAINS,
        user_location: { type: 'approximate', country: 'PT', timezone: 'Europe/Lisbon' }
    }
];

// Keep only well-formed user/assistant text turns, starting with a user turn.
function sanitizeMessages(input) {
    if (!Array.isArray(input)) {
        return [];
    }
    const messages = input
        .filter((m) => m && (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string' && m.content.trim())
        .slice(-MAX_HISTORY)
        .map((m) => ({ role: m.role, content: m.content.slice(0, MAX_MESSAGE_LENGTH) }));
    while (messages.length && messages[0].role !== 'user') {
        messages.shift();
    }
    return messages;
}

// Collect the distinct web pages cited in the reply's text blocks.
function collectSources(contentBlocks) {
    const sources = new Map();
    for (const block of contentBlocks) {
        if (block.type !== 'text' || !block.citations) {
            continue;
        }
        for (const citation of block.citations) {
            if (citation.url && !sources.has(citation.url)) {
                sources.set(citation.url, citation.title || citation.url);
            }
        }
    }
    return [...sources].slice(0, MAX_SOURCES);
}

function escapeLinkText(text) {
    return text.replace(/[[\]]/g, '');
}

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        res.setHeader('Allow', 'POST');
        return res.status(405).send({ error: 'method not allowed' });
    }

    const messages = sanitizeMessages(req.body?.messages);
    if (!messages.length || messages[messages.length - 1].role !== 'user') {
        return res.status(400).send({ error: 'messages must end with a user message' });
    }

    let client;
    try {
        client = new Anthropic();
    } catch (err) {
        console.error(err);
        return res.status(500).send({ error: 'O chat não está configurado.' });
    }

    let stream;
    let closed = false;
    // The response closing before we end it means the visitor went away.
    res.on('close', () => {
        if (!res.writableEnded) {
            closed = true;
            stream?.abort();
        }
    });

    let started = false;
    const startResponse = () => {
        if (!started) {
            res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'no-cache', 'X-Accel-Buffering': 'no' });
            started = true;
        }
    };

    try {
        const conversation = [...messages];
        const replyBlocks = [];
        let final;
        for (let attempt = 0; attempt <= MAX_CONTINUATIONS && !closed; attempt++) {
            stream = client.beta.messages.stream({
                model: MODEL,
                max_tokens: 8192,
                output_config: { effort: 'low' },
                betas: ['server-side-fallback-2026-07-01'],
                fallbacks: 'default',
                system: SYSTEM_PROMPT,
                tools: TOOLS,
                messages: conversation
            });
            for await (const event of stream) {
                if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
                    startResponse();
                    res.write(event.delta.text);
                }
            }
            final = await stream.finalMessage();
            replyBlocks.push(...final.content);
            if (final.stop_reason !== 'pause_turn') {
                break;
            }
            // Resend the paused turn unchanged; the API resumes the search loop from it.
            conversation.push({ role: 'assistant', content: final.content });
        }
        if (closed) {
            return;
        }

        startResponse();
        if (final?.stop_reason === 'refusal') {
            res.write('\n\nLamento, mas não posso ajudar com esse pedido.');
        }
        const sources = collectSources(replyBlocks);
        if (sources.length) {
            res.write('\n\n**Fontes:**\n' + sources.map(([url, title]) => `- [${escapeLinkText(title)}](${url.replace(/\(/g, '%28').replace(/\)/g, '%29')})`).join('\n'));
        }
        res.end();
    } catch (err) {
        if (closed || stream?.aborted) {
            return;
        }
        console.error(err);
        if (!res.headersSent) {
            const status = err instanceof Anthropic.RateLimitError ? 429 : err instanceof Anthropic.AuthenticationError ? 500 : 502;
            return res
                .status(status)
                .send({ error: status === 429 ? 'Demasiados pedidos. Tente novamente dentro de momentos.' : 'Não foi possível obter uma resposta.' });
        }
        res.end('\n\n[A resposta foi interrompida.]');
    }
}
