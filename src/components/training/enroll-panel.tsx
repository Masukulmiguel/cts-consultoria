'use client';

import { checkCredentials } from '@/actions/auth';
import { enrollInCourse, registerStudent } from '@/actions/registration';
import type { PublicCourse } from '@/lib/content-db';
import { Eye, EyeOff, Lock, Mail, ShieldCheck, UserPlus } from 'lucide-react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useActionState, useEffect, useState, useTransition } from 'react';

const COPY = {
  pt: {
    createTitle: 'Criar a minha conta',
    createIntro: 'A conta é criada na base de dados da CTS e fica pronta para o pagamento.',
    loginTitle: 'Já tenho conta',
    loginIntro: 'Entre com o email e a palavra-passe para confirmar a inscrição.',
    email: 'Email',
    name: 'Nome completo',
    password: 'Palavra-passe',
    totp: 'Código de verificação',
    create: 'Criar conta e inscrever-me',
    login: 'Entrar',
    confirm: 'Confirmar inscrição',
    showPassword: 'Mostrar palavra-passe',
    hidePassword: 'Ocultar palavra-passe',
    rateLimited: 'Demasiadas tentativas. Aguarde alguns minutos e tente novamente.',
    invalid: 'Email ou palavra-passe incorrectos.',
    signedIn: 'Sessão iniciada',
  },
  en: {
    createTitle: 'Create my account',
    createIntro: 'The account is created in the CTS database and is ready for payment.',
    loginTitle: 'I already have an account',
    loginIntro: 'Sign in with your email and password to confirm the enrolment.',
    email: 'Email',
    name: 'Full name',
    password: 'Password',
    totp: 'Verification code',
    create: 'Create account and enrol',
    login: 'Sign in',
    confirm: 'Confirm enrolment',
    showPassword: 'Show password',
    hidePassword: 'Hide password',
    rateLimited: 'Too many attempts. Please wait a few minutes and try again.',
    invalid: 'Incorrect email or password.',
    signedIn: 'Signed in',
  },
} as const;

const FIELD_CLASS =
  'w-full rounded-md border border-border bg-white py-2.5 pl-10 pr-3 text-sm text-ink shadow-xs transition placeholder:text-ink-muted focus:border-primary-400 focus:outline-none focus:ring-4 focus:ring-primary-100';

type Props = {
  locale: 'pt' | 'en';
  course: PublicCourse;
  isSignedIn: boolean;
};

export function EnrollPanel({ locale, course, isSignedIn }: Props) {
  const copy = COPY[locale];
  const router = useRouter();
  const [state, formAction, pending] = useActionState(registerStudent, null);
  const [enrollState, enrollAction, enrolling] = useActionState(enrollInCourse, null);
  const [mode, setMode] = useState<'create' | 'login'>('create');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [totp, setTotp] = useState('');
  const [needTotp, setNeedTotp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, startTransition] = useTransition();

  useEffect(() => {
    if (state?.status !== 'ok') return;
    const data = new FormData();
    data.set('courseId', course.id);
    data.set('locale', locale);
    startTransition(async () => {
      await enrollInCourse(null, data);
    });
  }, [state, course.id, locale]);

  function handleLogin(event: React.FormEvent) {
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
      router.refresh();
    });
  }

  if (isSignedIn) {
    return (
      <div className="card p-6">
        <p className="text-2xs font-semibold uppercase tracking-[0.14em] text-accent-600">
          {copy.signedIn}
        </p>
        <p className="mt-3 text-sm leading-relaxed text-ink-secondary">
          {locale === 'pt'
            ? 'Ao confirmar, a inscrição fica registada na base de dados e passa a aguardar pagamento.'
            : 'On confirmation the enrolment is stored in the database and waits for payment.'}
        </p>
        <form action={enrollAction} className="mt-5">
          <input type="hidden" name="courseId" value={course.id} />
          <input type="hidden" name="locale" value={locale} />
          {enrollState?.status === 'error' ? (
            <p
              role="alert"
              className="mb-4 rounded-md border border-error/30 bg-error-bg px-3 py-2.5 text-sm text-error"
            >
              {enrollState.message}
            </p>
          ) : null}
          <button
            type="submit"
            disabled={enrolling}
            className="btn-primary w-full disabled:opacity-60"
          >
            {enrolling ? '…' : copy.confirm}
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="card p-6">
      <div className="flex gap-2" role="tablist" aria-label={locale === 'pt' ? 'Acesso' : 'Access'}>
        <button
          type="button"
          role="tab"
          aria-selected={mode === 'create'}
          onClick={() => setMode('create')}
          className={`inline-flex items-center gap-1.5 rounded-pill px-4 py-2 text-sm font-semibold transition-colors ${
            mode === 'create'
              ? 'bg-primary-600 text-white'
              : 'bg-surface-muted text-ink-secondary hover:text-ink'
          }`}
        >
          <UserPlus size={15} />
          {locale === 'pt' ? 'Criar conta' : 'Create account'}
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={mode === 'login'}
          onClick={() => setMode('login')}
          className={`inline-flex items-center gap-1.5 rounded-pill px-4 py-2 text-sm font-semibold transition-colors ${
            mode === 'login'
              ? 'bg-primary-600 text-white'
              : 'bg-surface-muted text-ink-secondary hover:text-ink'
          }`}
        >
          <Lock size={15} />
          {locale === 'pt' ? 'Já tenho conta' : 'I have an account'}
        </button>
      </div>

      {mode === 'create' ? (
        <>
          <h3 className="mt-5 font-display text-lg font-semibold text-ink">{copy.createTitle}</h3>
          <p className="mt-1.5 text-sm leading-relaxed text-ink-secondary">{copy.createIntro}</p>

          <form action={formAction} className="mt-5 space-y-4">
            <input key="create-locale" type="hidden" name="locale" value={locale} />

            <div key="create-email">
              <label htmlFor="enrol-email" className="mb-1.5 block text-sm font-medium text-ink">
                {copy.email}
              </label>
              <div className="relative">
                <Mail
                  size={16}
                  aria-hidden="true"
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted"
                />
                <input
                  id="enrol-email"
                  name="email"
                  type="email"
                  required
                  autoComplete="email"
                  placeholder="nome@exemplo.com"
                  className={FIELD_CLASS}
                />
              </div>
            </div>

            <div key="create-name">
              <label htmlFor="enrol-name" className="mb-1.5 block text-sm font-medium text-ink">
                {copy.name}
              </label>
              <input
                id="enrol-name"
                name="name"
                type="text"
                required
                minLength={2}
                maxLength={80}
                autoComplete="name"
                className="block w-full rounded-md border border-border bg-white px-3.5 py-2.5 text-sm text-ink shadow-xs transition placeholder:text-ink-muted focus:border-primary-400 focus:outline-none focus:ring-4 focus:ring-primary-100"
              />
            </div>

            <div key="create-password">
              <label htmlFor="enrol-password" className="mb-1.5 block text-sm font-medium text-ink">
                {copy.password}
              </label>
              <div className="relative">
                <Lock
                  size={16}
                  aria-hidden="true"
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted"
                />
                <input
                  id="enrol-password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  minLength={8}
                  autoComplete="new-password"
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

            {state?.status === 'error' ? (
              <p
                key="create-error"
                role="alert"
                className="rounded-md border border-error/30 bg-error-bg px-3 py-2.5 text-sm text-error"
              >
                {state.message}
              </p>
            ) : null}

            <button
              key="create-submit"
              type="submit"
              disabled={pending}
              className="btn-primary w-full disabled:opacity-60"
            >
              {pending ? '…' : copy.create}
            </button>
          </form>
        </>
      ) : (
        <>
          <h3 className="mt-5 font-display text-lg font-semibold text-ink">{copy.loginTitle}</h3>
          <p className="mt-1.5 text-sm leading-relaxed text-ink-secondary">{copy.loginIntro}</p>

          <form onSubmit={handleLogin} className="mt-5 space-y-4">
            <div key="login-email">
              <label htmlFor="login-email" className="mb-1.5 block text-sm font-medium text-ink">
                {copy.email}
              </label>
              <div className="relative">
                <Mail
                  size={16}
                  aria-hidden="true"
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted"
                />
                <input
                  id="login-email"
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className={FIELD_CLASS}
                />
              </div>
            </div>

            <div key="login-password">
              <label htmlFor="login-password" className="mb-1.5 block text-sm font-medium text-ink">
                {copy.password}
              </label>
              <div className="relative">
                <Lock
                  size={16}
                  aria-hidden="true"
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted"
                />
                <input
                  id="login-password"
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
              <div key="login-totp">
                <label htmlFor="login-totp" className="mb-1.5 block text-sm font-medium text-ink">
                  {copy.totp}
                </label>
                <div className="relative">
                  <ShieldCheck
                    size={16}
                    aria-hidden="true"
                    className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted"
                  />
                  <input
                    id="login-totp"
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
                key="login-error"
                role="alert"
                className="rounded-md border border-error/30 bg-error-bg px-3 py-2.5 text-sm text-error"
              >
                {error}
              </p>
            ) : null}

            <button
              key="login-submit"
              type="submit"
              disabled={busy}
              className="btn-primary w-full disabled:opacity-60"
            >
              {busy ? '…' : copy.login}
            </button>
          </form>
        </>
      )}
    </div>
  );
}
