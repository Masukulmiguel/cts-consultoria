import type { Locale } from '@/i18n/routing';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { setRequestLocale } from 'next-intl/server';
import { notFound, redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function EnrollmentPage({
  params,
}: {
  params: Promise<{ locale: Locale; enrollmentId: string }>;
}) {
  const { locale, enrollmentId } = await params;
  setRequestLocale(locale);

  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) redirect(`/${locale}/aluno/login`);

  const enrollment = await prisma.enrollment.findUnique({
    where: { id: enrollmentId },
    select: { userId: true, currentStep: true },
  });
  if (!enrollment || enrollment.userId !== userId) notFound();

  redirect(`/${locale}/aluno/inscricao/${enrollmentId}/etapa/${enrollment.currentStep}`);
}
