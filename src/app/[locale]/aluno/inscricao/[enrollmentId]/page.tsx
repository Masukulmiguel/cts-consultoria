import { startOrResumeWizard } from '@/actions/enrollment-wizard/start';
import type { Locale } from '@/i18n/routing';
import { auth } from '@/lib/auth';
import { setRequestLocale } from 'next-intl/server';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function EnrollmentPage({
  params,
}: {
  params: Promise<{ locale: Locale; enrollmentId: string }>;
}) {
  const { locale, enrollmentId } = await params;
  setRequestLocale(locale);

  const session = await auth();
  if (!session?.user?.id) redirect(`/${locale}/aluno/login`);

  const { step } = await startOrResumeWizard(enrollmentId);
  if (step === 0) redirect(`/${locale}/aluno`);

  redirect(`/${locale}/aluno/inscricao/${enrollmentId}/etapa/${step}`);
}
