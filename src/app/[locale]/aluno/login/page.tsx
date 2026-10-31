import { StudentLoginForm } from '@/app/[locale]/aluno/login/student-login-form';
import type { Locale } from '@/i18n/routing';
import { setRequestLocale } from 'next-intl/server';
import Link from 'next/link';

export default async function StudentLoginPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const isPt = locale === 'pt';

  return (
    <div className="on-dark flex min-h-screen flex-col bg-ink">
      <div className="shell flex flex-1 items-center justify-center py-20">
        <div className="w-full max-w-md">
          <p className="text-2xs font-semibold uppercase tracking-[0.24em] text-accent-300">
            CTS Academia
          </p>
          <h1 className="mt-3 font-display text-3xl font-bold text-white">
            {isPt ? 'Área do formando' : 'Student area'}
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-white/70">
            {isPt
              ? 'Entre com as credenciais recebidas na inscrição para aceder aos materiais, presenças e certificados.'
              : 'Sign in with the credentials received at enrolment to access materials, attendance and certificates.'}
          </p>

          <div className="mt-8 rounded-xl border border-white/12 bg-white/5 p-7 backdrop-blur-sm">
            <StudentLoginForm callbackUrl={`/${locale}/aluno`} />
          </div>

          <p className="mt-6 text-xs text-white/50">
            {isPt ? 'Ainda não tem conta?' : 'No account yet?'}{' '}
            <Link
              href={`/${locale}/contactos#contacto`}
              className="font-semibold text-white underline"
            >
              {isPt ? 'Contacte a CTS' : 'Contact CTS'}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
