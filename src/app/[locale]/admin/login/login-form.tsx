'use client';

import { checkCredentials } from '@/actions/auth';
import { Eye, EyeOff, Lock, Mail, ShieldCheck } from 'lucide-react';
import { signIn } from 'next-auth/react';
import { useTranslations } from 'next-intl';
import { useSearchParams } from 'next/navigation';
import { useState, useTransition } from 'react';

const FIELD_CLASS =
  'w-full rounded-md border border-border bg-white py-2.5 pl-10 pr-3 text-sm text-ink shadow-xs transition placeholder:text-ink-muted focus:border-primary-400 focus:outline-none focus:ring-4 focus:ring-primary-100';

export function LoginForm() {
  const t = useTranslations('admin');
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') ?? '/pt/admin';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [totp, setTotp] = useState('');
  const [needTotp, setNeedTotp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
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
        <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-ink">
          {t('email')}
        </label>
        <div className="relative">
          <Mail
            size={16}
            aria-hidden="true"
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted"
          />
          <input
            id="email"
            type="email"
            required
            autoComplete="email"
            placeholder="nome@empresa.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={FIELD_CLASS}
          />
        </div>
      </div>

      <div>
        <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-ink">
          {t('password')}
        </label>
        <div className="relative">
          <Lock
            size={16}
            aria-hidden="true"
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted"
          />
          <input
            id="password"
            type={showPassword ? 'text' : 'password'}
            required
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={`${FIELD_CLASS} pr-11`}
          />
          <button
            type="button"
            onClick={() => setShowPassword((value) => !value)}
            aria-label={showPassword ? t('hidePassword') : t('showPassword')}
            className="absolute right-1 top-1/2 inline-flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-md text-ink-muted transition-colors hover:text-primary-600"
          >
            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
      </div>

      {needTotp && (
        <div>
          <label htmlFor="totp" className="mb-1.5 block text-sm font-medium text-ink">
            {t('totp')}
          </label>
          <div className="relative">
            <ShieldCheck
              size={16}
              aria-hidden="true"
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted"
            />
            <input
              id="totp"
              inputMode="numeric"
              pattern="[0-9]{6}"
              maxLength={6}
              required
              value={totp}
              onChange={(e) => setTotp(e.target.value)}
              className={`${FIELD_CLASS} tracking-[0.3em]`}
            />
          </div>
        </div>
      )}

      {error && (
        <p
          role="alert"
          className="rounded-md border border-error/30 bg-error-bg px-3 py-2.5 text-sm text-error"
        >
          {error}
        </p>
      )}

      <button type="submit" disabled={pending} className="btn-primary w-full disabled:opacity-60">
        {pending ? `${t('signIn')}…` : t('signIn')}
      </button>
    </form>
  );
}
