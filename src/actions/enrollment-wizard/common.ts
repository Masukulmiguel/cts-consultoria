import { auth } from '@/lib/auth';
import { type Actor, transitionEnrollment } from '@/lib/enrollment-state';
import type { ComparedField } from '@/lib/ocr/compare';
import { prisma } from '@/lib/prisma';
import type { Enrollment, EnrollmentDocument, StudentProfile, User } from '@prisma/client';
import { notFound } from 'next/navigation';

export type WizardActionResult = {
  ok: boolean;
  errors?: Record<string, string>;
  message?: string;
  nextStep?: number;
  comparison?: ComparedField[];
};

export type OwnedEnrollment = Enrollment & {
  user: User & { studentProfile: StudentProfile | null };
  documents: EnrollmentDocument[];
};

/** Carrega a inscrição e confirma que pertence ao utilizador autenticado. */
export async function loadOwnedEnrollment(enrollmentId: string): Promise<OwnedEnrollment> {
  const session = await auth();
  const userId = session?.user?.id;

  const enrollment = await prisma.enrollment.findUnique({
    where: { id: enrollmentId },
    include: { user: { include: { studentProfile: true } }, documents: true },
  });

  if (!enrollment || !userId || enrollment.userId !== userId) {
    notFound();
  }

  return enrollment;
}

/** Actor actual (formando autenticado). */
export async function currentActor(): Promise<Actor> {
  const session = await auth();
  if (!session?.user?.id) {
    notFound();
  }
  return { userId: session.user.id, role: session.user.role };
}

/**
 * Se o administrador pediu correcções, a inscrição volta a `PENDING_DOCUMENTS`
 * assim que o formando submete os dados corrigidos.
 */
export async function applyCorrectionIfNeeded(enrollment: Enrollment, actor: Actor): Promise<void> {
  if (enrollment.status !== 'CORRECTION_REQUIRED') return;

  const result = await transitionEnrollment({
    enrollmentId: enrollment.id,
    to: 'PENDING_DOCUMENTS',
    actor,
    reason: 'Correcções submetidas pelo formando',
  });

  if (!result.ok) {
    throw new Error(result.message);
  }
}
