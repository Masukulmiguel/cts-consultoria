'use client';

import { checkCredentials } from '@/actions/auth';
import { Eye, EyeOff, Lock, Mail, ShieldCheck } from 'lucide-react';
import { signIn } from 'next-auth/react';
import { useState, useTransition } from 'react';

export type StudentLoginFormProps = {
  callbackUrl: string;
  locale: 'pt' | 'en';
};

const COPY = {
  pt: {
    email: 'Email',
    password: 'Palavra-passe',
    totp: 'Código de verificação',
    signIn: 'Entrar',
    showPassword: 'Mostrar palavra-passe',
    hidePassword: 'Ocultar palavra-passe',
    rateLimited: 'Demasiadas tentativas. Aguarde alguns minutos e tente novamente.',
    invalid: 'Email ou palavra-passe incorrectos.',
  },
  en: {
    email: 'Email',
    password: 'Password',
    totp: 'Verification code',
    signIn: 'Sign in',
    showPassword: 'Show password',
    hidePassword: 'Hide password',
    rateLimited: 'Too many attempts. Please wait a few minutes and try again.',
    invalid: 'Incorrect email or password.',
  },
} as const;

const FIELD_CLASS =
  'w-full rounded-md border border-border bg-white py-2.5 pl-10 pr-3 text-sm text-ink shadow-xs transition placeholder:text-ink-muted focus:border-primary-400 focus:outline-none focus:ring-4 focus:ring-primary-100';

export function StudentLoginForm({ callbackUrl, locale }: StudentLoginFormProps) {
  const copy = COPY[locale];
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
          setError(copy.rateLimited);
          return;
        }
        if (result !== 'ok') {
          setError(copy.invalid);
          return;
        }
      }

      const res = await signIn('credentials', { email, password, totp, redirect: false });
      if (res?.error) {
        setError(copy.invalid);
        return;
      }
      window.location.href = callbackUrl;
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label htmlFor="student-email" className="mb-1.5 block text-sm font-medium text-ink">
          {copy.email}
        </label>
        <div className="relative">
          <Mail
            size={16}
            aria-hidden="true"
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted"
          />
          <input
            id="student-email"
            type="email"
            required
            autoComplete="email"
            placeholder="nome@exemplo.com"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className={FIELD_CLASS}
          />
        </div>
      </div>

      <div>
        <label htmlFor="student-password" className="mb-1.5 block text-sm font-medium text-ink">
          {copy.password}
        </label>
        <div className="relative">
          <Lock
            size={16}
            aria-hidden="true"
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted"
          />
          <input
            id="student-password"
            type={showPassword ? 'text' : 'password'}
            required
            autoComplete="current-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className={`${FIELD_CLASS} pr-11`}
          />
          <button
            type="button"
            onClick={() => setShowPassword((value) => !value)}
            aria-label={showPassword ? copy.hidePassword : copy.showPassword}
            className="absolute right-1 top-1/2 inline-flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-md text-ink-muted transition-colors hover:text-primary-600"
          >
            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
      </div>

      {needTotp ? (
        <div>
          <label htmlFor="student-totp" className="mb-1.5 block text-sm font-medium text-ink">
            {copy.totp}
          </label>
          <div className="relative">
            <ShieldCheck
              size={16}
              aria-hidden="true"
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted"
            />
            <input
              id="student-totp"
              inputMode="numeric"
              pattern="[0-9]{6}"
              maxLength={6}
              required
              value={totp}
              onChange={(event) => setTotp(event.target.value)}
              className={`${FIELD_CLASS} tracking-[0.3em]`}
            />
          </div>
        </div>
      ) : null}

      {error ? (
        <p
          role="alert"
          className="rounded-md border border-error/30 bg-error-bg px-3 py-2.5 text-sm text-error"
        >
          {error}
        </p>
      ) : null}

      <button type="submit" disabled={pending} className="btn-primary w-full disabled:opacity-60">
        {pending ? `${copy.signIn}…` : copy.signIn}
      </button>
    </form>
  );
}
