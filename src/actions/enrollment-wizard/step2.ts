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
  const extraido = {
    fullName: String(formData.get('ocrFullName') ?? '').trim(),
    biNumber: String(formData.get('ocrBiNumber') ?? '').trim(),
    birthDate: String(formData.get('ocrBirthDate') ?? '').trim(),
  };
  // O resultado do OCR fica guardado com a origem explícita (spec §7): nunca
  // pode ser confundido com verificação oficial.
  const ocrGuardado = temOcr
    ? {
        source: 'client',
        engine: 'tesseract.js',
        lang: 'por+eng',
        confidence: confianca,
        raw: ocrRaw,
        extracted: extraido,
      }
    : null;

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
      ...(ocrGuardado ? { ocrRaw: ocrGuardado } : {}),
      reviewStatus: 'PENDING',
    },
    update: {
      storageKey: guardado.storageKey,
      mimeType: guardado.mimeType,
      byteSize: guardado.byteSize,
      sha256: guardado.sha256,
      ocrStatus: temOcr ? 'DONE' : 'NOT_RUN',
      ocrRaw: ocrGuardado ?? Prisma.DbNull,
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

  const documentos = await prisma.enrollmentDocument.findMany({
    where: { enrollmentId },
    select: { kind: true },
  });
  const etapaConcluida =
    documentos.some((documento) => documento.kind === 'BI_FRONT') &&
    documentos.some((documento) => documento.kind === 'BI_BACK');

  // O `currentStep` nunca regride: só avança quando os dois documentos do
  // Bilhete de Identidade estão gravados.
  const currentStep = etapaConcluida ? Math.max(enrollment.currentStep, 3) : enrollment.currentStep;
  if (currentStep !== enrollment.currentStep) {
    await prisma.enrollment.update({
      where: { id: enrollmentId },
      data: { currentStep },
    });
  }

  const actor = await currentActor();
  await applyCorrectionIfNeeded(enrollment, actor);

  return { ok: true, nextStep: etapaConcluida ? 3 : 2, comparison };
}
