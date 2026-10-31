'use client';

import { submitContact } from '@/actions/contact';
import { useLocale } from 'next-intl';
import { useActionState } from 'react';

const inputCls =
  'block w-full rounded-md border border-border bg-surface px-3.5 py-2.5 text-sm text-ink transition-colors placeholder:text-ink-muted focus:border-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-600/20';

const labelCls = 'block text-sm font-medium text-ink';

export function ContactForm({ locale }: { locale: 'pt' | 'en' }) {
  const currentLocale = useLocale();
  const [state, formAction, pending] = useActionState(submitContact, null);

  if (state?.status === 'success') {
    return (
      <output className="block rounded-lg border border-primary-200 bg-primary-50 p-7 text-sm text-ink">
        <p className="font-display text-lg font-semibold text-primary-800">
          {locale === 'pt' ? 'Mensagem enviada' : 'Message sent'}
        </p>
        <p className="mt-2 leading-relaxed text-ink-secondary">
          {locale === 'pt'
            ? 'Recebemos o seu pedido. A equipa CTS responde em horário de expediente — normalmente em menos de um dia útil.'
            : 'We received your request. The CTS team replies during business hours — normally within one working day.'}
        </p>
      </output>
    );
  }

  return (
    <form action={formAction} className="space-y-5" noValidate>
      <input type="hidden" name="locale" value={currentLocale} />
      <input
        type="text"
        name="website"
        tabIndex={-1}
        autoComplete="off"
        className="hidden"
        aria-hidden="true"
      />

      <div>
        <label htmlFor="name" className={labelCls}>
          {locale === 'pt' ? 'Nome' : 'Name'}
        </label>
        <input id="name" name="name" required maxLength={120} className={`mt-1.5 ${inputCls}`} />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="email" className={labelCls}>
            {locale === 'pt' ? 'E-mail' : 'Email'}
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            maxLength={190}
            className={`mt-1.5 ${inputCls}`}
          />
        </div>
        <div>
          <label htmlFor="phone" className={labelCls}>
            {locale === 'pt' ? 'Telefone' : 'Phone'}
          </label>
          <input
            id="phone"
            name="phone"
            type="tel"
            maxLength={40}
            className={`mt-1.5 ${inputCls}`}
          />
        </div>
      </div>

      <div>
        <label htmlFor="subject" className={labelCls}>
          {locale === 'pt' ? 'Assunto' : 'Subject'}
        </label>
        <input id="subject" name="subject" maxLength={200} className={`mt-1.5 ${inputCls}`} />
      </div>

      <div>
        <label htmlFor="message" className={labelCls}>
          {locale === 'pt' ? 'Mensagem' : 'Message'}
        </label>
        <textarea
          id="message"
          name="message"
          rows={6}
          required
          maxLength={4000}
          className={`mt-1.5 ${inputCls}`}
        />
      </div>

      {state?.status === 'error' && (
        <p
          className="rounded-md border border-accent-200 bg-accent-50 p-3.5 text-sm text-accent-700"
          role="alert"
        >
          {state.message}
        </p>
      )}

      <div className="flex flex-wrap items-center gap-4">
        <button type="submit" disabled={pending} className="btn-primary disabled:opacity-60">
          {pending
            ? locale === 'pt'
              ? 'A enviar...'
              : 'Sending...'
            : locale === 'pt'
              ? 'Enviar mensagem'
              : 'Send message'}
        </button>
        <p className="text-xs leading-relaxed text-ink-muted">
          {locale === 'pt'
            ? 'Os seus dados são utilizados apenas para responder ao pedido, nos termos da lei de protecção de dados.'
            : 'Your data is used only to answer your request, in accordance with data protection law.'}
        </p>
      </div>
    </form>
  );
}
