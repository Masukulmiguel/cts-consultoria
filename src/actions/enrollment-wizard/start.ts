'use server';

import { auth } from '@/lib/auth';
import { legacyStatusToNew } from '@/lib/enrollment-status-legacy';
import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';

const ESTADOS_COM_WIZARD = new Set(['DRAFT', 'PENDING_DOCUMENTS', 'CORRECTION_REQUIRED']);

/**
 * Entra no wizard de inscrição (ou retoma). Devolve o passo a abrir; `0`
 * significa que a inscrição já não tem wizard (submetida, aprovada, recusada
 * ou cancelada).
 */
export async function startOrResumeWizard(enrollmentId: string): Promise<{ step: number }> {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) notFound();

  const enrollment = await prisma.enrollment.findUnique({
    where: { id: enrollmentId },
    select: { id: true, userId: true, status: true, currentStep: true },
  });
  if (!enrollment || enrollment.userId !== userId) notFound();

  await prisma.studentProfile.upsert({
    where: { userId },
    create: { userId },
    update: {},
  });

  const status = legacyStatusToNew(enrollment.status);
  if (!ESTADOS_COM_WIZARD.has(status)) return { step: 0 };

  return { step: enrollment.currentStep };
}
