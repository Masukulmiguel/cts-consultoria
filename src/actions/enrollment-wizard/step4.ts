'use server';

import { createHash } from 'node:crypto';

import { transitionEnrollment } from '@/lib/enrollment-state';
import { step4Schema } from '@/lib/enrollment-wizard/schemas';
import { parseAmountKz } from '@/lib/ocr/extract-amount';
import { getPaymentSettings } from '@/lib/payment-settings';
import { paymentDuplicateHash } from '@/lib/payments/duplicate-hash';
import { prisma } from '@/lib/prisma';
import { uploadEnrollmentDocument } from '@/lib/storage/enrollment-documents';
import { Prisma } from '@prisma/client';
import {
  type WizardActionResult,
  applyCorrectionIfNeeded,
  currentActor,
  loadOwnedEnrollment,
} from './common';

const DIVERGENCIA_TOLERANCIA = 0.005;

type FicheiroGuardado = Awaited<ReturnType<typeof uploadEnrollmentDocument>>;

export async function saveStep4(
  enrollmentId: string,
  _prev: WizardActionResult | null,
  formData: FormData,
): Promise<WizardActionResult> {
  const enrollment = await loadOwnedEnrollment(enrollmentId);

  const curso = await prisma.course.findUnique({ where: { id: enrollment.courseId } });
  if (!curso) {
    return { ok: false, message: 'Curso não encontrado.' };
  }

  const settings = await getPaymentSettings();
  if (!settings.bank && !settings.express && !settings.instructions) {
    return {
      ok: false,
      message:
        'Dados de pagamento em configuração: contacte a secretaria para obter as instruções.',
    };
  }

  const method = String(formData.get('method') ?? '');
  const amount = parseAmountKz(String(formData.get('amount') ?? '')) ?? Number.NaN;
  const reference = String(formData.get('reference') ?? '').trim();
  const paymentDate = String(formData.get('paymentDate') ?? '').trim();
  const ocrValue = String(formData.get('ocrValue') ?? '').trim();
  const ocrReference = String(formData.get('ocrReference') ?? '').trim();
  const ocrRaw = String(formData.get('ocrRaw') ?? '').trim();
  const ocrDate = String(formData.get('ocrDate') ?? '').trim();
  const ocrConfidence = Number(formData.get('ocrConfidence') ?? Number.NaN);

  const parsed = step4Schema.safeParse({
    method,
    amount,
    reference,
    paymentDate,
    ocrValue,
    ocrReference,
  });

  if (!parsed.success) {
    const errors: Record<string, string> = {};
    for (const [campo, mensagens] of Object.entries(parsed.error.flatten().fieldErrors)) {
      const mensagem = mensagens?.[0];
      if (mensagem) errors[campo] = mensagem;
    }
    return { ok: false, errors };
  }

  // O valor oficial é sempre o preço do curso na BD: o valor enviado pelo
  // cliente serve apenas para preencher o formulário e nunca decide.
  const precoOficial = parseAmountKz(curso.price ?? '');
  if (precoOficial === null || precoOficial <= 0) {
    return {
      ok: false,
      message: 'O curso não tem preço configurado. Contacte a secretaria.',
    };
  }

  const ficheiro = formData.get('file');
  const temFicheiro = ficheiro instanceof File && ficheiro.size > 0;
  let bytes: Uint8Array | null = null;
  let sha256Ficheiro: string | null = null;

  if (temFicheiro) {
    bytes = new Uint8Array(await ficheiro.arrayBuffer());
    sha256Ficheiro = createHash('sha256').update(bytes).digest('hex');
  }

  const referenciaEfectiva = parsed.data.reference || ocrReference;
  const baseDuplicado = referenciaEfectiva || sha256Ficheiro || `inscricao:${enrollmentId}`;

  const hash = paymentDuplicateHash({
    reference: baseDuplicado,
    amount: precoOficial,
    paymentDate: parsed.data.paymentDate,
  });

  const duplicado = await prisma.paymentSubmission.findFirst({
    where: { duplicateCheckHash: hash, enrollmentId: { not: enrollmentId } },
  });
  if (duplicado) {
    return {
      ok: false,
      message: 'Comprovativo já utilizado noutra inscrição. Envie um comprovativo diferente.',
    };
  }

  let guardado: FicheiroGuardado | null = null;
  if (bytes) {
    try {
      guardado = await uploadEnrollmentDocument({
        enrollmentId,
        userId: enrollment.userId,
        kind: 'PROOF',
        bytes,
        declaredType: (ficheiro as File).type,
      });
    } catch (error) {
      return {
        ok: false,
        errors: {
          file:
            error instanceof Error ? error.message : 'Não foi possível carregar o comprovativo.',
        },
      };
    }
  }

  const valorExtraido = ocrValue ? parseAmountKz(ocrValue) : null;
  const divergente =
    valorExtraido !== null && Math.abs(valorExtraido - precoOficial) > DIVERGENCIA_TOLERANCIA;
  const temOcr = ocrRaw.length > 0;
  const confianca = Number.isFinite(ocrConfidence) ? ocrConfidence : null;
  const reviewStatus = divergente ? 'DIVERGENT' : 'PENDING';

  if (guardado) {
    await prisma.enrollmentDocument.upsert({
      where: { enrollmentId_kind: { enrollmentId, kind: 'PROOF' } },
      create: {
        enrollmentId,
        kind: 'PROOF',
        storageKey: guardado.storageKey,
        mimeType: guardado.mimeType,
        byteSize: guardado.byteSize,
        sha256: guardado.sha256,
        ocrStatus: temOcr ? 'DONE' : 'NOT_RUN',
        ...(temOcr ? { ocrRaw, ocrConfidence: confianca, ocrSource: 'client' } : {}),
        reviewStatus,
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
        reviewStatus,
      },
    });
  }

  const ocrExtract = temOcr
    ? {
        raw: ocrRaw,
        ...(ocrValue ? { amount: ocrValue } : {}),
        ...(ocrReference ? { reference: ocrReference } : {}),
        ...(ocrDate ? { date: ocrDate } : {}),
      }
    : null;

  await prisma.paymentSubmission.upsert({
    where: { enrollmentId },
    create: {
      enrollmentId,
      method: parsed.data.method,
      amount: precoOficial,
      currency: 'AOA',
      reference: referenciaEfectiva || null,
      ...(ocrExtract ? { ocrExtract } : {}),
      ocrStatus: temOcr ? 'DONE' : 'NOT_RUN',
      duplicateCheckHash: hash,
      reviewStatus,
    },
    update: {
      method: parsed.data.method,
      amount: precoOficial,
      reference: referenciaEfectiva || null,
      ocrExtract: ocrExtract ?? Prisma.DbNull,
      ocrStatus: temOcr ? 'DONE' : 'NOT_RUN',
      duplicateCheckHash: hash,
      reviewStatus,
    },
  });

  const actor = await currentActor();

  if (enrollment.status === 'DRAFT') {
    const transicao = await transitionEnrollment({
      enrollmentId,
      to: 'PENDING_DOCUMENTS',
      actor,
      reason: 'Etapa 4 (pagamento e comprovativo) concluída',
    });
    if (!transicao.ok) {
      return { ok: false, message: transicao.message };
    }
  } else {
    await applyCorrectionIfNeeded(enrollment, actor);
  }

  await prisma.enrollment.update({
    where: { id: enrollmentId },
    data: { currentStep: 5 },
  });

  return {
    ok: true,
    nextStep: 5,
    ...(divergente
      ? { message: 'Valor divergente — encaminhado para análise administrativa.' }
      : {}),
  };
}
