'use client';

import { checkCredentials } from '@/actions/auth';
import { signIn } from 'next-auth/react';
import { useState, useTransition } from 'react';

export type StudentLoginFormProps = {
  callbackUrl: string;
};

export function StudentLoginForm({ callbackUrl }: StudentLoginFormProps) {
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
          setError('Demasiadas tentativas. Aguarde alguns minutos e tente novamente.');
          return;
        }
        if (result !== 'ok') {
          setError('Email ou palavra-passe incorrectos.');
          return;
        }
      }

      const res = await signIn('credentials', { email, password, totp, redirect: false });
      if (res?.error) {
        setError('Email ou palavra-passe incorrectos.');
        return;
      }
      window.location.href = callbackUrl;
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label htmlFor="student-email" className="mb-1 block text-sm font-medium text-ink">
          Email
        </label>
        <input
          id="student-email"
          type="email"
          required
          autoComplete="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className="w-full rounded-md border border-border bg-surface px-3 py-2.5 text-sm text-ink focus:border-primary-400 focus:outline-none"
        />
      </div>
      <div>
        <label htmlFor="student-password" className="mb-1 block text-sm font-medium text-ink">
          Palavra-passe
        </label>
        <input
          id="student-password"
          type="password"
          required
          autoComplete="current-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          className="w-full rounded-md border border-border bg-surface px-3 py-2.5 text-sm text-ink focus:border-primary-400 focus:outline-none"
        />
      </div>
      {needTotp ? (
        <div>
          <label htmlFor="student-totp" className="mb-1 block text-sm font-medium text-ink">
            Código de verificação
          </label>
          <input
            id="student-totp"
            inputMode="numeric"
            pattern="[0-9]{6}"
            maxLength={6}
            required
            value={totp}
            onChange={(event) => setTotp(event.target.value)}
            className="w-full rounded-md border border-border bg-surface px-3 py-2.5 text-sm tracking-widest text-ink focus:border-primary-400 focus:outline-none"
          />
        </div>
      ) : null}

      {error ? (
        <p
          role="alert"
          className="rounded-md border border-accent-500/40 bg-accent-500/10 px-3 py-2 text-sm text-accent-700"
        >
          {error}
        </p>
      ) : null}

      <button type="submit" disabled={pending} className="btn-primary w-full">
        {pending ? 'A entrar…' : 'Entrar'}
      </button>
    </form>
  );
}
