import { Stepper } from '@/components/enrollment/stepper';
import type { Locale } from '@/i18n/routing';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { setRequestLocale } from 'next-intl/server';
import { notFound, redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function EnrollmentLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string; enrollmentId: string }>;
}) {
  const { locale: rawLocale, enrollmentId } = await params;
  const locale = rawLocale as Locale;
  setRequestLocale(locale);

  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) redirect(`/${locale}/aluno/login`);

  const enrollment = await prisma.enrollment.findUnique({
    where: { id: enrollmentId },
    select: { userId: true, currentStep: true },
  });
  if (!enrollment || enrollment.userId !== userId) notFound();

  return (
    <div className="min-h-screen bg-surface-muted">
      <div className="shell py-8">
        <Stepper
          currentStep={enrollment.currentStep}
          basePath={`/${locale}/aluno/inscricao/${enrollmentId}/etapa`}
        />
        <div className="mt-5">{children}</div>
      </div>
    </div>
  );
}
