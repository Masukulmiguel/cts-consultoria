import { prisma } from '@/lib/prisma';
import { createEnrollmentDocumentUrl } from '@/lib/storage/enrollment-documents';
import type { UserRole } from '@prisma/client';

/** Carrega a inscrição do wizard com tudo o que as etapas precisam. */
export async function loadWizardEnrollment(enrollmentId: string) {
  return prisma.enrollment.findUnique({
    where: { id: enrollmentId },
    include: {
      user: { include: { studentProfile: true } },
      course: true,
      documents: true,
      paymentSubmission: true,
    },
  });
}

/**
 * URL assinada (10 minutos) para pré-visualizar um documento do próprio
 * formando. Devolve null quando o storage não está configurado.
 */
export async function signedPreview(
  storageKey: string,
  actor: { userId: string; role: UserRole },
): Promise<string | null> {
  try {
    return await createEnrollmentDocumentUrl(storageKey, actor);
  } catch {
    return null;
  }
}
