import { StudentLoginForm } from '@/app/[locale]/aluno/login/student-login-form';
import { LoginShell } from '@/components/auth/login-shell';
import type { Locale } from '@/i18n/routing';
import { localePath } from '@/lib/site';
import { setRequestLocale } from 'next-intl/server';

export default async function StudentLoginPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const isPt = locale === 'pt';

  return (
    <LoginShell
      title={isPt ? 'Bem-vindo de volta!' : 'Welcome back!'}
      subtitle={
        isPt
          ? 'Introduza os seus dados para aceder à sua conta.'
          : 'Enter your details to access your account.'
      }
      help={isPt ? 'Ainda não tem conta?' : 'No account yet?'}
      helpLinkLabel={isPt ? 'Contacte a CTS.' : 'Contact CTS.'}
      helpHref={`${localePath(locale, 'contact')}#contacto`}
      brandLabel="CTS Consultoria Empresarial & Gestão de Negócios"
    >
      <StudentLoginForm callbackUrl={`/${locale}/aluno`} locale={locale} />
      <p className="mt-5 text-xs leading-relaxed text-ink-muted">
        {isPt
          ? 'Entre com as credenciais recebidas na inscrição para aceder aos materiais, presenças e certificados.'
          : 'Sign in with the credentials received at enrolment to access materials, attendance and certificates.'}
      </p>
    </LoginShell>
  );
}
