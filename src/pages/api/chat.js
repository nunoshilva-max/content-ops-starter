import Anthropic from '@anthropic-ai/sdk';

const MODEL = 'claude-opus-5-5';
const MAX_HISTORY = 40;
const MAX_MESSAGE_LENGTH = 4000;

const SYSTEM_PROMPT =
    process.env.CHAT_SYSTEM_PROMPT ||
    'You are a friendly assistant embedded in a website chat window. Keep answers short and conversational, and use Markdown only when it helps readability.';

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
        return res.status(500).send({ error: 'chat is not configured' });
    }

    const stream = client.beta.messages.stream({
        model: MODEL,
        max_tokens: 4096,
        output_config: { effort: 'low' },
        betas: ['server-side-fallback-2026-07-01'],
        fallbacks: 'default',
        system: SYSTEM_PROMPT,
        messages
    });

    req.on('close', () => stream.abort());

    try {
        let started = false;
        for await (const event of stream) {
            if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
                if (!started) {
                    res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'no-cache', 'X-Accel-Buffering': 'no' });
                    started = true;
                }
                res.write(event.delta.text);
            }
        }
        const final = await stream.finalMessage();
        if (!started) {
            res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' });
        }
        if (final.stop_reason === 'refusal') {
            res.write("\n\nSorry, I can't help with that request.");
        }
        res.end();
    } catch (err) {
        if (stream.aborted) {
            return;
        }
        console.error(err);
        if (!res.headersSent) {
            const status = err instanceof Anthropic.RateLimitError ? 429 : err instanceof Anthropic.AuthenticationError ? 500 : 502;
            return res.status(status).send({ error: status === 429 ? 'too many requests, try again shortly' : 'failed to get a reply' });
        }
        res.end('\n\n[The reply was interrupted.]');
    }
}
