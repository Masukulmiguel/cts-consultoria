'use server';

import { compareIdentity } from '@/lib/ocr/compare';
import { prisma } from '@/lib/prisma';
import { type DocKind, uploadEnrollmentDocument } from '@/lib/storage/enrollment-documents';
import { Prisma } from '@prisma/client';
import {
  type WizardActionResult,
  applyCorrectionIfNeeded,
  currentActor,
  loadOwnedEnrollment,
} from './common';

const KINDS: readonly DocKind[] = ['BI_FRONT', 'BI_BACK'];

export async function saveStep2(
  enrollmentId: string,
  _prev: WizardActionResult | null,
  formData: FormData,
): Promise<WizardActionResult> {
  const enrollment = await loadOwnedEnrollment(enrollmentId);

  const kind = String(formData.get('kind') ?? '');
  if (!KINDS.includes(kind as DocKind)) {
    return { ok: false, errors: { kind: 'Indique a frente ou o verso do documento.' } };
  }

  const ficheiro = formData.get('file');
  if (!(ficheiro instanceof File) || ficheiro.size === 0) {
    return { ok: false, errors: { file: 'Seleccione o ficheiro do documento.' } };
  }

  const bytes = new Uint8Array(await ficheiro.arrayBuffer());

  let guardado: Awaited<ReturnType<typeof uploadEnrollmentDocument>>;
  try {
    guardado = await uploadEnrollmentDocument({
      enrollmentId,
      userId: enrollment.userId,
      kind: kind as DocKind,
      bytes,
      declaredType: ficheiro.type,
    });
  } catch (error) {
    return {
      ok: false,
      errors: {
        file: error instanceof Error ? error.message : 'Não foi possível carregar o documento.',
      },
    };
  }

  const ocrRaw = String(formData.get('ocrRaw') ?? '').trim();
  const ocrConfidence = Number(formData.get('ocrConfidence') ?? Number.NaN);
  const temOcr = ocrRaw.length > 0;
  const confianca = Number.isFinite(ocrConfidence) ? ocrConfidence : null;

  await prisma.enrollmentDocument.upsert({
    where: { enrollmentId_kind: { enrollmentId, kind: kind as DocKind } },
    create: {
      enrollmentId,
      kind: kind as DocKind,
      storageKey: guardado.storageKey,
      mimeType: guardado.mimeType,
      byteSize: guardado.byteSize,
      sha256: guardado.sha256,
      ocrStatus: temOcr ? 'DONE' : 'NOT_RUN',
      ...(temOcr ? { ocrRaw, ocrConfidence: confianca, ocrSource: 'client' } : {}),
      reviewStatus: 'PENDING',
    },
    update: {
      storageKey: guardado.storageKey,
      mimeType: guardado.mimeType,
      byteSize: guardado.byteSize,
      sha256: guardado.sha256,
      ocrStatus: temOcr ? 'DONE' : 'NOT_RUN',
      ocrRaw: temOcr ? ocrRaw : Prisma.DbNull,
      ocrConfidence: temOcr ? confianca : null,
      ocrSource: temOcr ? 'client' : null,
      reviewStatus: 'PENDING',
    },
  });

  const perfil = enrollment.user.studentProfile;
  const comparison = compareIdentity(
    {
      fullName: enrollment.user.name ?? '',
      biNumber: perfil?.biNumber ?? '',
      birthDate: perfil?.birthDate ? perfil.birthDate.toISOString().slice(0, 10) : '',
    },
    {
      fullName: String(formData.get('ocrFullName') ?? ''),
      biNumber: String(formData.get('ocrBiNumber') ?? ''),
      birthDate: String(formData.get('ocrBirthDate') ?? ''),
    },
  );

  await prisma.enrollment.update({
    where: { id: enrollmentId },
    data: { currentStep: 3 },
  });

  const actor = await currentActor();
  await applyCorrectionIfNeeded(enrollment, actor);

  return { ok: true, nextStep: 3, comparison };
}
