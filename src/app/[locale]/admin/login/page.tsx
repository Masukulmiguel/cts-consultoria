import { LoginShell } from '@/components/auth/login-shell';
import type { Locale } from '@/i18n/routing';
import { localePath } from '@/lib/site';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Suspense } from 'react';
import { LoginForm } from './login-form';

export default async function AdminLoginPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('admin');

  return (
    <LoginShell
      title={t('loginHeading')}
      subtitle={t('loginIntro')}
      help={t('loginHelp')}
      helpLinkLabel={t('loginHelpLink')}
      helpHref={localePath(locale as Locale, 'contact')}
      brandLabel="CTS Consultoria Empresarial & Gestão de Negócios"
    >
      <Suspense>
        <LoginForm />
      </Suspense>
    </LoginShell>
  );
}
