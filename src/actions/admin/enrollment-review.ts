'use server';

import {
  REQUIREMENT_LABELS,
  enrollmentMissingRequirements,
  transitionEnrollment,
} from '@/lib/enrollment-state';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/rbac';
import type { UserRole } from '@prisma/client';

const ROLES_REVISAO: UserRole[] = ['SUPER_ADMIN', 'ADMIN', 'SUPPORT'];

type Resultado = { ok: boolean; message?: string };

async function actorDeRevisao(): Promise<{ id: string; role: UserRole }> {
  const user = await requireRole('SUPER_ADMIN', 'ADMIN', 'SUPPORT');
  return { id: user.id, role: user.role };
}

/** Grava a revisão de um documento (BI, fotografia ou comprovativo). */
export async function reviewDocument(input: {
  enrollmentId: string;
  documentId: string;
  decision: 'APPROVED' | 'REJECTED' | 'DIVERGENT' | 'NOT_READABLE';
  reason?: string;
}): Promise<Resultado> {
  const actor = await actorDeRevisao();

  const documento = await prisma.enrollmentDocument.findFirst({
    where: { id: input.documentId, enrollmentId: input.enrollmentId },
  });
  if (!documento) return { ok: false, message: 'Documento não encontrado.' };

  if (input.decision === 'REJECTED' && !input.reason?.trim()) {
    return { ok: false, message: 'Indique o motivo da rejeição do documento.' };
  }

  await prisma.$transaction(async (tx) => {
    await tx.enrollmentDocument.update({
      where: { id: documento.id },
      data: {
        reviewStatus: input.decision,
        reviewedById: actor.id,
        rejectionReason: input.decision === 'REJECTED' ? (input.reason?.trim() ?? null) : null,
      },
    });

    await tx.auditLog.create({
      data: {
        userId: actor.id,
        action: 'enrollment.document.review',
        entityType: 'enrollment',
        entityId: input.enrollmentId,
        metadata: {
          documentId: documento.id,
          kind: documento.kind,
          decision: input.decision,
          reason: input.reason?.trim() || null,
        },
      },
    });
  });

  return { ok: true };
}

/**
 * Revê o pagamento. O papel SUPPORT pode rejeitar (para escalar a caso), mas
 * não pode aprovar: a confirmação de pagamento é exclusiva de ADMIN/SUPER_ADMIN.
 */
export async function reviewPayment(input: {
  enrollmentId: string;
  decision: 'APPROVED' | 'REJECTED';
  reason?: string;
}): Promise<Resultado> {
  const actor = await actorDeRevisao();

  if (input.decision === 'APPROVED' && actor.role === 'SUPPORT') {
    return {
      ok: false,
      message: 'O papel SUPPORT não pode aprovar o pagamento. Escale a um administrador.',
    };
  }

  const submissao = await prisma.paymentSubmission.findUnique({
    where: { enrollmentId: input.enrollmentId },
  });
  if (!submissao) return { ok: false, message: 'Submissão de pagamento não encontrada.' };

  if (input.decision === 'REJECTED' && !input.reason?.trim()) {
    return { ok: false, message: 'Indique o motivo da rejeição do pagamento.' };
  }

  await prisma.$transaction(async (tx) => {
    await tx.paymentSubmission.update({
      where: { enrollmentId: input.enrollmentId },
      data: {
        reviewStatus: input.decision,
        reviewedById: actor.id,
        rejectionReason: input.decision === 'REJECTED' ? (input.reason?.trim() ?? null) : null,
      },
    });

    await tx.auditLog.create({
      data: {
        userId: actor.id,
        action: 'enrollment.payment.review',
        entityType: 'enrollment',
        entityId: input.enrollmentId,
        metadata: {
          decision: input.decision,
          reason: input.reason?.trim() || null,
        },
      },
    });
  });

  return { ok: true };
}

/** Pede correcções ao formando: a inscrição passa a `CORRECTION_REQUIRED`. */
export async function requestCorrection(input: {
  enrollmentId: string;
  fields: string[];
  message: string;
}): Promise<{ ok: boolean }> {
  const actor = await actorDeRevisao();
  const mensagem = input.message.trim();
  if (!mensagem) return { ok: false };

  const inscricao = await prisma.enrollment.findUnique({
    where: { id: input.enrollmentId },
    select: { id: true, userId: true },
  });
  if (!inscricao) return { ok: false };

  const transicao = await transitionEnrollment({
    enrollmentId: input.enrollmentId,
    to: 'CORRECTION_REQUIRED',
    actor: { userId: actor.id, role: actor.role },
    reason: mensagem,
  });
  if (!transicao.ok) return { ok: false };

  const campos = input.fields.map((campo) => campo.trim()).filter(Boolean);
  await prisma.notification.create({
    data: {
      userId: inscricao.userId,
      kind: 'enrollment.correction',
      title: 'Correcções solicitadas',
      body: `${mensagem}${campos.length > 0 ? ` Campos a corrigir: ${campos.join(', ')}.` : ''}`,
      href: `/pt/aluno/inscricao/${input.enrollmentId}`,
    },
  });

  return { ok: true };
}

/**
 * Atribui a validação a um membro da equipa. A atribuição fica em auditoria e
 * em notificação (o modelo `Enrollment` não tem campo de revisor).
 */
export async function assignReviewer(input: {
  enrollmentId: string;
  reviewerId: string;
}): Promise<{ ok: boolean }> {
  const actor = await actorDeRevisao();

  const [inscricao, revisor] = await Promise.all([
    prisma.enrollment.findUnique({ where: { id: input.enrollmentId }, select: { id: true } }),
    prisma.user.findUnique({ where: { id: input.reviewerId }, select: { id: true, role: true } }),
  ]);
  if (!inscricao || !revisor) return { ok: false };
  if (!ROLES_REVISAO.includes(revisor.role)) return { ok: false };

  await prisma.$transaction(async (tx) => {
    await tx.auditLog.create({
      data: {
        userId: actor.id,
        action: 'enrollment.reviewer.assign',
        entityType: 'enrollment',
        entityId: input.enrollmentId,
        metadata: { reviewerId: input.reviewerId },
      },
    });

    await tx.notification.create({
      data: {
        userId: input.reviewerId,
        kind: 'enrollment.review.assigned',
        title: 'Inscrição atribuída para validação',
        body: 'Uma inscrição foi atribuída para validação documental e financeira.',
        href: `/pt/admin/enrollments/${input.enrollmentId}`,
      },
    });
  });

  return { ok: true };
}

/** Aprova a inscrição (estado final). */
export async function approveEnrollment(input: {
  enrollmentId: string;
  reason?: string;
}): Promise<Resultado> {
  const actor = await requireRole('SUPER_ADMIN', 'ADMIN');
  const actorId = { userId: actor.id, role: actor.role };

  const inscricao = await prisma.enrollment.findUnique({
    where: { id: input.enrollmentId },
    include: {
      user: { include: { studentProfile: true } },
      documents: true,
      paymentSubmission: true,
    },
  });
  if (!inscricao) return { ok: false, message: 'Inscrição não encontrada.' };

  const emFalta = enrollmentMissingRequirements(inscricao);
  if (emFalta.length > 0) {
    return {
      ok: false,
      message: `Faltam requisitos: ${emFalta.map((requisito) => REQUIREMENT_LABELS[requisito]).join(', ')}.`,
    };
  }

  const transicao = await transitionEnrollment({
    enrollmentId: input.enrollmentId,
    to: 'APPROVED',
    actor: actorId,
    reason: input.reason?.trim() || 'Inscrição aprovada após validação documental e financeira',
  });
  if (!transicao.ok) return { ok: false, message: transicao.message };

  return { ok: true };
}

/** Recusa a inscrição com motivo obrigatório. */
export async function rejectEnrollment(input: {
  enrollmentId: string;
  reason: string;
}): Promise<{ ok: boolean }> {
  const actor = await requireRole('SUPER_ADMIN', 'ADMIN');
  const motivo = input.reason.trim();
  if (!motivo) return { ok: false };

  const transicao = await transitionEnrollment({
    enrollmentId: input.enrollmentId,
    to: 'REJECTED',
    actor: { userId: actor.id, role: actor.role },
    reason: motivo,
  });

  return { ok: transicao.ok };
}
