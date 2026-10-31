'use client';

import { CHAT_SUGGESTIONS, type ChatLink } from '@/content/chatbot';
import { Bot, Loader2, Send, X } from 'lucide-react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { useCallback, useEffect, useRef, useState } from 'react';

type Message = {
  id: string;
  role: 'bot' | 'user';
  text: string;
  links?: ChatLink[];
  suggestions?: string[];
};

const COPY = {
  pt: {
    title: 'Assistente CTS',
    subtitle: 'Respostas sobre serviços, formação e contactos',
    open: 'Abrir assistente virtual',
    close: 'Fechar assistente virtual',
    input: 'Escreva a sua mensagem',
    send: 'Enviar',
    thinking: 'A escrever…',
    disclaimer: 'Assistente virtual CTS. Para propostas, fale com a nossa equipa.',
    greeting:
      'Olá! Sou o assistente da CTS Consultoria. Posso ajudar com serviços de contabilidade, fiscalidade, formação ou contactos. Como posso ajudar?',
  },
  en: {
    title: 'CTS Assistant',
    subtitle: 'Answers on services, training and contacts',
    open: 'Open virtual assistant',
    close: 'Close virtual assistant',
    input: 'Type your message',
    send: 'Send',
    thinking: 'Typing…',
    disclaimer: 'CTS virtual assistant. For proposals, talk to our team.',
    greeting:
      'Hello! I am the CTS Consulting assistant. I can help with accounting, tax, training or contact questions. How can I help?',
  },
} as const;

let messageId = 0;
const nextId = () => `m-${++messageId}`;

export function ChatbotWidget({ locale }: { locale: 'pt' | 'en' }) {
  const copy = COPY[locale];
  const reduce = useReducedMotion();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const [started, setStarted] = useState(false);

  const triggerRef = useRef<HTMLButtonElement>(null);
  const logRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false);
        triggerRef.current?.focus();
      }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [open]);

  useEffect(() => {
    if (open && !started) {
      setStarted(true);
      setMessages([
        {
          id: nextId(),
          role: 'bot',
          text: copy.greeting,
          suggestions: [...CHAT_SUGGESTIONS[locale]],
        },
      ]);
    }
  }, [copy.greeting, locale, open, started]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: redesenha o scroll quando chegam mensagens ou muda o estado
  useEffect(() => {
    const log = logRef.current;
    if (log) log.scrollTop = log.scrollHeight;
  }, [busy, messages, open]);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  const send = useCallback(
    async (raw: string) => {
      const text = raw.trim();
      if (!text || busy) return;
      setInput('');
      setMessages((current) => [...current, { id: nextId(), role: 'user', text }]);
      setBusy(true);
      try {
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: text, locale }),
        });
        if (!response.ok) throw new Error('chat_failed');
        const reply = (await response.json()) as {
          text: string;
          links?: ChatLink[];
          suggestions?: string[];
        };
        setMessages((current) => [
          ...current,
          {
            id: nextId(),
            role: 'bot',
            text: reply.text,
            links: reply.links,
            suggestions: reply.suggestions,
          },
        ]);
      } catch {
        setMessages((current) => [
          ...current,
          {
            id: nextId(),
            role: 'bot',
            text:
              locale === 'pt'
                ? 'Não foi possível enviar a mensagem. Tente novamente ou fale connosco pelos contactos do site.'
                : 'Your message could not be sent. Try again or reach us through the site contacts.',
          },
        ]);
      } finally {
        setBusy(false);
        inputRef.current?.focus();
      }
    },
    [busy, locale],
  );

  return (
    <div className="no-print fixed right-5 bottom-5 z-40 flex flex-col items-end gap-3">
      <AnimatePresence>
        {open && (
          <motion.dialog
            open
            aria-label={copy.title}
            initial={reduce ? false : { opacity: 0, y: 16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, y: 16, scale: 0.96 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="static m-0 flex h-[480px] w-[min(22rem,calc(100vw-2.5rem))] max-w-none flex-col overflow-hidden rounded-xl border border-border bg-surface text-inherit shadow-xl"
          >
            <header className="flex items-center gap-3 border-b border-border bg-ink px-4 py-3 text-white">
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-accent-500">
                <Bot size={18} aria-hidden="true" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold">{copy.title}</p>
                <p className="truncate text-xs text-white/60">{copy.subtitle}</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  triggerRef.current?.focus();
                }}
                aria-label={copy.close}
                className="inline-flex h-9 w-9 items-center justify-center rounded-full transition-colors hover:bg-white/10"
              >
                <X size={18} />
              </button>
            </header>

            <div
              ref={logRef}
              role="log"
              aria-live="polite"
              aria-relevant="additions"
              className="flex-1 space-y-3 overflow-y-auto bg-surface-muted px-4 py-4"
            >
              {messages.map((message) => (
                <div key={message.id}>
                  <div
                    className={`max-w-[85%] rounded-lg px-3.5 py-2.5 text-sm leading-relaxed ${
                      message.role === 'bot'
                        ? 'rounded-tl-sm border border-border bg-surface text-ink shadow-xs'
                        : 'ml-auto rounded-tr-sm bg-primary-600 text-white'
                    }`}
                  >
                    {message.text}
                  </div>
                  {message.links?.length ? (
                    <ul className="mt-2 ml-1 space-y-1.5">
                      {message.links.map((link) => (
                        <li key={link.href}>
                          <a
                            href={link.href}
                            target={link.external ? '_blank' : undefined}
                            rel={link.external ? 'noopener noreferrer' : undefined}
                            className="inline-flex items-center gap-1.5 rounded-md border border-primary-200 bg-primary-50 px-2.5 py-1.5 text-xs font-semibold text-primary-700 transition-colors hover:bg-primary-100"
                          >
                            {link.label}
                          </a>
                        </li>
                      ))}
                    </ul>
                  ) : null}
                  {message.role === 'bot' && message.suggestions?.length ? (
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {message.suggestions.map((suggestion) => (
                        <button
                          key={suggestion}
                          type="button"
                          onClick={() => send(suggestion)}
                          className="rounded-pill border border-border bg-surface px-3 py-1.5 text-xs font-semibold text-ink-secondary transition-colors hover:border-primary-300 hover:text-primary-700"
                        >
                          {suggestion}
                        </button>
                      ))}
                    </div>
                  ) : null}
                </div>
              ))}
              {busy ? (
                <div className="inline-flex items-center gap-2 rounded-lg border border-border bg-surface px-3 py-2 text-xs text-ink-muted shadow-xs">
                  <Loader2 size={14} className="animate-spin" aria-hidden="true" />
                  {copy.thinking}
                </div>
              ) : null}
            </div>

            <form
              onSubmit={(event) => {
                event.preventDefault();
                send(input);
              }}
              className="flex items-center gap-2 border-t border-border bg-surface px-3 py-3"
            >
              <label htmlFor="chatbot-input" className="sr-only">
                {copy.input}
              </label>
              <input
                id="chatbot-input"
                ref={inputRef}
                value={input}
                onChange={(event) => setInput(event.target.value)}
                placeholder={copy.input}
                maxLength={500}
                autoComplete="off"
                className="min-h-10 w-full flex-1 rounded-md border border-border bg-surface-muted px-3 text-sm text-ink placeholder:text-ink-muted focus:border-primary-400 focus:outline-none"
              />
              <button
                type="submit"
                disabled={busy || !input.trim()}
                aria-label={copy.send}
                className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-primary-600 text-white transition-colors hover:bg-primary-700 disabled:pointer-events-none disabled:opacity-45"
              >
                <Send size={17} />
              </button>
            </form>
          </motion.dialog>
        )}
      </AnimatePresence>

      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-label={open ? copy.close : copy.open}
        className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-accent-500 text-white shadow-lg transition duration-200 ease-cts-enter hover:-translate-y-0.5 hover:bg-accent-600 hover:shadow-xl"
      >
        <AnimatePresence mode="wait" initial={false}>
          <motion.span
            key={open ? 'close' : 'open'}
            initial={reduce ? false : { opacity: 0, rotate: -45, scale: 0.8 }}
            animate={{ opacity: 1, rotate: 0, scale: 1 }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, rotate: 45, scale: 0.8 }}
            transition={{ duration: 0.15 }}
            className="inline-flex"
          >
            {open ? <X size={24} /> : <Bot size={24} />}
          </motion.span>
        </AnimatePresence>
      </button>
    </div>
  );
}
