'use client';

import { useLocale } from 'next-intl';
import { useActionState } from 'react';
import { submitContact } from '@/actions/contact';

const inputCls =
  'block w-full rounded border border-gray-300 px-3 py-2 text-sm text-ink placeholder:text-gray-400 focus:border-brand-blue focus:outline-none focus:ring-2 focus:ring-brand-blue/30';

export function ContactForm({ locale }: { locale: 'pt' | 'en' }) {
  const currentLocale = useLocale();
  const [state, formAction, pending] = useActionState(submitContact, null);

  if (state?.status === 'success') {
    return (
      <div className="rounded border border-[#0E7A4F]/30 bg-[#0E7A4F]/10 p-6 text-sm text-ink" role="status">
        <p className="font-semibold">{locale === 'pt' ? 'Submissão successful' : 'Submission successful'}</p>
        <p className="mt-1 text-gray-600">{locale === 'pt' ? 'A mensagem foi enviada com sucesso.' : 'Your message has been sent successfully.'}</p>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-4" noValidate>
      <input type="hidden" name="locale" value={currentLocale} />
      {/* Honeypot: campo oculto para bots */}
      <input type="text" name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" />

      <div>
        <label htmlFor="name" className="block text-sm font-medium text-ink">
          {locale === 'pt' ? 'Nome' : 'Name'}
        </label>
        <input id="name" name="name" required maxLength={120} className={`mt-1 ${inputCls}`} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-ink">
            {locale === 'pt' ? 'E-mail' : 'Email'}
          </label>
          <input id="email" name="email" type="email" required maxLength={190} className={`mt-1 ${inputCls}`} />
        </div>
        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-ink">
            {locale === 'pt' ? 'Telefone' : 'Phone'}
          </label>
          <input id="phone" name="phone" type="tel" maxLength={40} className={`mt-1 ${inputCls}`} />
        </div>
      </div>

      <div>
        <label htmlFor="subject" className="block text-sm font-medium text-ink">
          {locale === 'pt' ? 'Assunto' : 'Subject'}
        </label>
        <input id="subject" name="subject" maxLength={200} className={`mt-1 ${inputCls}`} />
      </div>

      <div>
        <label htmlFor="message" className="block text-sm font-medium text-ink">
          {locale === 'pt' ? 'Mensagem' : 'Message'}
        </label>
        <textarea id="message" name="message" rows={6} required maxLength={4000} className={`mt-1 ${inputCls}`} />
      </div>

      {state?.status === 'error' && (
        <p className="rounded border border-brand-red/40 bg-brand-red/10 p-3 text-sm text-ink" role="alert">
          {locale === 'pt' ? 'Erro' : 'Error'}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="inline-flex items-center justify-center rounded bg-brand-blue px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-blue-dark disabled:opacity-60"
      >
        {pending ? (locale === 'pt' ? 'Enviando' : 'Submitting') : (locale === 'pt' ? 'Enviar' : 'Submit')}
      </button>
      <p className="text-xs text-gray-500">
        {locale === 'pt' ? 'Disclaimer' : 'Disclaimer'}
      </p>
    </form>
  );
}