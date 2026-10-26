'use client';

import { checkCredentials } from '@/actions/auth';
import { signIn } from 'next-auth/react';
import { useTranslations } from 'next-intl';
import { useSearchParams } from 'next/navigation';
import { useState, useTransition } from 'react';

export function LoginForm() {
  const t = useTranslations('admin');
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') ?? '/pt/admin';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [totp, setTotp] = useState('');
  const [needTotp, setNeedTotp] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);

    startTransition(async () => {
      if (!needTotp) {
        const result = await checkCredentials({ email, password });
        if (result === 'mfa') {
          setNeedTotp(true);
          return;
        }
        if (result === 'rate_limited') {
          setError(t('rateLimited'));
          return;
        }
        if (result !== 'ok') {
          setError(t('invalid'));
          return;
        }
      }

      const res = await signIn('credentials', { email, password, totp, redirect: false });
      if (res?.error) {
        setError(t('invalid'));
        return;
      }
      window.location.href = callbackUrl;
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label htmlFor="email" className="mb-1 block text-sm font-medium">
          {t('email')}
        </label>
        <input
          id="email"
          type="email"
          required
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded border border-gray-300 px-3 py-2"
        />
      </div>
      <div>
        <label htmlFor="password" className="mb-1 block text-sm font-medium">
          {t('password')}
        </label>
        <input
          id="password"
          type="password"
          required
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full rounded border border-gray-300 px-3 py-2"
        />
      </div>
      {needTotp && (
        <div>
          <label htmlFor="totp" className="mb-1 block text-sm font-medium">
            {t('totp')}
          </label>
          <input
            id="totp"
            inputMode="numeric"
            pattern="[0-9]{6}"
            maxLength={6}
            required
            value={totp}
            onChange={(e) => setTotp(e.target.value)}
            className="w-full rounded border border-gray-300 px-3 py-2 tracking-widest"
          />
        </div>
      )}
      {error && (
        <p
          role="alert"
          className="rounded border border-danger/30 bg-danger/10 px-3 py-2 text-sm text-danger"
        >
          {error}
        </p>
      )}
      <button
        type="submit"
        disabled={pending}
        className="w-full rounded bg-brand-blue px-4 py-2.5 font-semibold text-white transition-colors hover:bg-brand-blue-dark disabled:opacity-60"
      >
        {t('signIn')}
      </button>
    </form>
  );
}
