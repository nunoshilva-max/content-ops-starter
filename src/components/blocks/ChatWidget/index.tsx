import * as React from 'react';
import classNames from 'classnames';
import Markdown from 'markdown-to-jsx';

type ChatMessage = { role: 'user' | 'assistant'; content: string };

const GREETING = 'Hi! How can I help you today?';

export default function ChatWidget() {
    const [isOpen, setIsOpen] = React.useState(false);
    const [messages, setMessages] = React.useState<ChatMessage[]>([]);
    const [input, setInput] = React.useState('');
    const [isSending, setIsSending] = React.useState(false);
    const [error, setError] = React.useState<string | null>(null);
    const listRef = React.useRef<HTMLDivElement>(null);
    const inputRef = React.useRef<HTMLTextAreaElement>(null);
    const abortRef = React.useRef<AbortController | null>(null);

    React.useEffect(() => {
        if (isOpen) {
            inputRef.current?.focus();
        }
    }, [isOpen]);

    React.useEffect(() => {
        listRef.current?.scrollTo({ top: listRef.current.scrollHeight });
    }, [messages, isOpen]);

    React.useEffect(() => () => abortRef.current?.abort(), []);

    async function sendMessage() {
        const text = input.trim();
        if (!text || isSending) {
            return;
        }
        const history: ChatMessage[] = [...messages, { role: 'user', content: text }];
        setMessages([...history, { role: 'assistant', content: '' }]);
        setInput('');
        setError(null);
        setIsSending(true);

        const controller = new AbortController();
        abortRef.current = controller;
        try {
            const response = await fetch('/api/chat/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ messages: history }),
                signal: controller.signal
            });
            if (!response.ok || !response.body) {
                const body = await response.json().catch(() => ({}));
                throw new Error(body.error || 'Something went wrong');
            }
            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let reply = '';
            while (true) {
                const { done, value } = await reader.read();
                if (done) {
                    break;
                }
                reply += decoder.decode(value, { stream: true });
                setMessages([...history, { role: 'assistant', content: reply }]);
            }
        } catch (err) {
            if (controller.signal.aborted) {
                return;
            }
            // Drop the empty assistant bubble and put the text back so the user can retry.
            setMessages(messages);
            setInput(text);
            setError(err instanceof Error ? err.message : 'Something went wrong');
        } finally {
            setIsSending(false);
        }
    }

    function handleKeyDown(event: React.KeyboardEvent<HTMLTextAreaElement>) {
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            sendMessage();
        }
    }

    function resetChat() {
        abortRef.current?.abort();
        setMessages([]);
        setError(null);
        setIsSending(false);
    }

    return (
        <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end gap-3 sm:bottom-6 sm:right-6">
            {isOpen && (
                <div
                    role="dialog"
                    aria-label="Chat"
                    className="flex h-[min(560px,calc(100vh-7rem))] w-[calc(100vw-2rem)] flex-col overflow-hidden rounded-2xl border border-neutralAlt/20 bg-white text-dark shadow-2xl sm:w-96"
                >
                    <div className="flex items-center justify-between bg-primary px-4 py-3 text-light">
                        <span className="font-semibold">Chat with us</span>
                        <div className="flex items-center gap-1">
                            <button type="button" onClick={resetChat} className="rounded px-2 py-1 text-sm opacity-80 hover:opacity-100" aria-label="Start a new chat">
                                New
                            </button>
                            <button type="button" onClick={() => setIsOpen(false)} className="rounded px-2 py-1 text-xl leading-none opacity-80 hover:opacity-100" aria-label="Close chat">
                                ×
                            </button>
                        </div>
                    </div>
                    <div ref={listRef} className="flex-1 space-y-3 overflow-y-auto px-4 py-4" aria-live="polite">
                        <ChatBubble role="assistant" content={GREETING} />
                        {messages.map((message, index) => (
                            <ChatBubble key={index} role={message.role} content={message.content} />
                        ))}
                        {error && <p className="text-center text-sm text-red-600">{error}</p>}
                    </div>
                    <form
                        className="flex items-end gap-2 border-t border-neutralAlt/20 p-3"
                        onSubmit={(event) => {
                            event.preventDefault();
                            sendMessage();
                        }}
                    >
                        <textarea
                            ref={inputRef}
                            rows={1}
                            value={input}
                            onChange={(event) => setInput(event.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Type a message…"
                            aria-label="Message"
                            className="max-h-32 flex-1 resize-none rounded-xl border border-neutralAlt/30 px-3 py-2 text-sm focus:border-primary focus:outline-none"
                        />
                        <button
                            type="submit"
                            disabled={isSending || !input.trim()}
                            className="rounded-xl bg-primary px-4 py-2 text-sm font-medium text-light transition-opacity disabled:opacity-50"
                        >
                            Send
                        </button>
                    </form>
                </div>
            )}
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                aria-expanded={isOpen}
                aria-label={isOpen ? 'Close chat' : 'Open chat'}
                className="flex h-14 w-14 items-center justify-center rounded-full bg-primary text-light shadow-lg transition-transform hover:scale-105"
            >
                {isOpen ? (
                    <span className="text-2xl leading-none">×</span>
                ) : (
                    <svg viewBox="0 0 24 24" className="h-6 w-6 fill-current" aria-hidden="true">
                        <path d="M4 4h16a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H8l-4 4V6a2 2 0 0 1 2-2z" />
                    </svg>
                )}
            </button>
        </div>
    );
}

function ChatBubble({ role, content }: ChatMessage) {
    const isUser = role === 'user';
    return (
        <div className={classNames('flex', isUser ? 'justify-end' : 'justify-start')}>
            <div
                className={classNames(
                    'max-w-[85%] break-words rounded-2xl px-3 py-2 text-sm',
                    isUser ? 'whitespace-pre-wrap rounded-br-sm bg-primary text-light' : 'rounded-bl-sm bg-neutral text-dark [&_*+*]:mt-2 [&_a]:underline [&_ol]:list-decimal [&_ol]:pl-5 [&_pre]:overflow-x-auto [&_ul]:list-disc [&_ul]:pl-5'
                )}
            >
                {isUser ? content : content ? <Markdown options={{ forceBlock: true }}>{content}</Markdown> : <TypingDots />}
            </div>
        </div>
    );
}

function TypingDots() {
    return (
        <span className="flex gap-1 py-1" aria-label="Assistant is typing">
            {[0, 150, 300].map((delay) => (
                <span key={delay} className="h-2 w-2 animate-bounce rounded-full bg-current opacity-60" style={{ animationDelay: `${delay}ms` }} />
            ))}
        </span>
    );
}
