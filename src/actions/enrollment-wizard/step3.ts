'use server';

import { prisma } from '@/lib/prisma';
import { uploadEnrollmentDocument } from '@/lib/storage/enrollment-documents';
import { Prisma } from '@prisma/client';
import {
  type WizardActionResult,
  applyCorrectionIfNeeded,
  currentActor,
  loadOwnedEnrollment,
} from './common';

export async function saveStep3(
  enrollmentId: string,
  _prev: WizardActionResult | null,
  formData: FormData,
): Promise<WizardActionResult> {
  const enrollment = await loadOwnedEnrollment(enrollmentId);

  const ficheiro = formData.get('file');
  if (!(ficheiro instanceof File) || ficheiro.size === 0) {
    return { ok: false, errors: { file: 'Seleccione a fotografia.' } };
  }

  const bytes = new Uint8Array(await ficheiro.arrayBuffer());

  let guardado: Awaited<ReturnType<typeof uploadEnrollmentDocument>>;
  try {
    guardado = await uploadEnrollmentDocument({
      enrollmentId,
      userId: enrollment.userId,
      kind: 'PHOTO',
      bytes,
      declaredType: ficheiro.type,
    });
  } catch (error) {
    return {
      ok: false,
      errors: {
        file: error instanceof Error ? error.message : 'Não foi possível carregar a fotografia.',
      },
    };
  }

  await prisma.enrollmentDocument.upsert({
    where: { enrollmentId_kind: { enrollmentId, kind: 'PHOTO' } },
    create: {
      enrollmentId,
      kind: 'PHOTO',
      storageKey: guardado.storageKey,
      mimeType: guardado.mimeType,
      byteSize: guardado.byteSize,
      sha256: guardado.sha256,
      ocrStatus: 'NOT_RUN',
      reviewStatus: 'PENDING',
    },
    update: {
      storageKey: guardado.storageKey,
      mimeType: guardado.mimeType,
      byteSize: guardado.byteSize,
      sha256: guardado.sha256,
      ocrStatus: 'NOT_RUN',
      ocrRaw: Prisma.DbNull,
      ocrConfidence: null,
      ocrSource: null,
      reviewStatus: 'PENDING',
    },
  });

  await prisma.enrollment.update({
    where: { id: enrollmentId },
    data: { currentStep: 4 },
  });

  const actor = await currentActor();
  await applyCorrectionIfNeeded(enrollment, actor);

  return { ok: true, nextStep: 4 };
}
