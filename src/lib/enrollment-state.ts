import { legacyStatusToNew } from '@/lib/enrollment-status-legacy';
import { prisma } from '@/lib/prisma';
import type {
  DocumentKind,
  DocumentReviewStatus,
  EnrollmentStatus,
  UserRole,
} from '@prisma/client';

export type Actor = { userId: string; role: UserRole };
export type TransitionCode = 'NOT_ALLOWED' | 'FORBIDDEN' | 'MISSING_REQUIREMENTS';
export type TransitionResult =
  | { ok: true; to: EnrollmentStatus }
  | { ok: false; code: TransitionCode; message: string };

export type Transition = {
  from: EnrollmentStatus | 'ANY';
  to: EnrollmentStatus;
  roles: readonly UserRole[];
  requiresReason?: boolean;
  requires?: readonly ('profile' | 'documents' | 'payment')[];
};

export const REQUIRED_DOCUMENT_KINDS: readonly DocumentKind[] = [
  'BI_FRONT',
  'BI_BACK',
  'PHOTO',
  'PROOF',
];

export const TRANSITIONS: readonly Transition[] = [
  { from: 'DRAFT', to: 'PENDING_DOCUMENTS', roles: ['STUDENT'] },
  {
    from: 'PENDING_DOCUMENTS',
    to: 'SUBMITTED',
    roles: ['STUDENT'],
    requires: ['profile', 'documents'],
  },
  { from: 'SUBMITTED', to: 'UNDER_REVIEW', roles: ['ADMIN', 'SUPER_ADMIN', 'SUPPORT'] },
  {
    from: 'UNDER_REVIEW',
    to: 'CORRECTION_REQUIRED',
    roles: ['ADMIN', 'SUPER_ADMIN', 'SUPPORT'],
    requiresReason: true,
  },
  { from: 'CORRECTION_REQUIRED', to: 'PENDING_DOCUMENTS', roles: ['STUDENT'] },
  {
    from: 'UNDER_REVIEW',
    to: 'PAYMENT_PENDING_VERIFICATION',
    roles: ['ADMIN', 'SUPER_ADMIN', 'SUPPORT'],
    requires: ['documents'],
  },
  {
    from: 'PAYMENT_PENDING_VERIFICATION',
    to: 'APPROVED',
    roles: ['ADMIN', 'SUPER_ADMIN'],
    requires: ['profile', 'documents', 'payment'],
  },
  {
    from: 'SUBMITTED',
    to: 'REJECTED',
    roles: ['ADMIN', 'SUPER_ADMIN'],
    requiresReason: true,
  },
  {
    from: 'UNDER_REVIEW',
    to: 'REJECTED',
    roles: ['ADMIN', 'SUPER_ADMIN'],
    requiresReason: true,
  },
  {
    from: 'PAYMENT_PENDING_VERIFICATION',
    to: 'REJECTED',
    roles: ['ADMIN', 'SUPER_ADMIN'],
    requiresReason: true,
  },
  {
    from: 'ANY',
    to: 'CANCELLED',
    roles: ['STUDENT', 'ADMIN', 'SUPER_ADMIN'],
    requiresReason: true,
  },
];

export type RequirementsInput = {
  profileComplete: boolean;
  documentKinds: DocumentKind[];
  documentsApproved: boolean;
  paymentApproved: boolean;
};

type ProfileLike = {
  nif?: string | null;
  biNumber?: string | null;
  birthDate?: Date | null;
  address?: string | null;
  municipality?: string | null;
  province?: string | null;
  phone?: string | null;
} | null;

type DocumentLike = { kind: DocumentKind; reviewStatus: DocumentReviewStatus };

function findTransition(from: EnrollmentStatus, to: EnrollmentStatus): Transition | undefined {
  return (
    TRANSITIONS.find((rule) => rule.from === from && rule.to === to) ??
    TRANSITIONS.find((rule) => rule.from === 'ANY' && rule.to === to)
  );
}

/** Indica se o papel indicado pode executar a transição. */
export function canTransition(
  from: EnrollmentStatus,
  to: EnrollmentStatus,
  role: UserRole,
): boolean {
  const rule = findTransition(from, to);
  return rule ? rule.roles.includes(role) : false;
}

function hasAllDocumentKinds(kinds: readonly DocumentKind[]): boolean {
  return REQUIRED_DOCUMENT_KINDS.every((kind) => kinds.includes(kind));
}

function hasApprovedDocuments(documents: readonly DocumentLike[]): boolean {
  return (
    hasAllDocumentKinds(documents.map((document) => document.kind)) &&
    documents.every((document) => document.reviewStatus === 'APPROVED')
  );
}

function isProfileComplete(profile: ProfileLike | undefined, userName?: string | null): boolean {
  if (!profile) return false;
  const hasDocumentNumber = Boolean(profile.nif?.trim() || profile.biNumber?.trim());
  return (
    hasDocumentNumber &&
    Boolean(profile.birthDate) &&
    Boolean(profile.address?.trim()) &&
    Boolean(profile.municipality?.trim()) &&
    Boolean(profile.province?.trim()) &&
    Boolean(profile.phone?.trim()) &&
    Boolean(userName?.trim())
  );
}

/**
 * Requisitos em falta para aprovar: perfil completo, os 4 documentos aprovados
 * e o comprovativo de pagamento aprovado.
 */
export function missingRequirements(
  input: RequirementsInput,
): Array<'profile' | 'documents' | 'payment'> {
  const missing: Array<'profile' | 'documents' | 'payment'> = [];
  if (!input.profileComplete) missing.push('profile');
  if (!hasAllDocumentKinds(input.documentKinds) || !input.documentsApproved) {
    missing.push('documents');
  }
  if (!input.paymentApproved) missing.push('payment');
  return missing;
}

function unmetRequirements(
  to: EnrollmentStatus,
  requires: readonly ('profile' | 'documents' | 'payment')[],
  input: RequirementsInput,
): Array<'profile' | 'documents' | 'payment'> {
  if (to === 'APPROVED') return missingRequirements(input);

  const missing: Array<'profile' | 'documents' | 'payment'> = [];
  for (const requirement of requires) {
    if (requirement === 'profile' && !input.profileComplete) missing.push('profile');
    if (requirement === 'documents') {
      const kindsComplete = hasAllDocumentKinds(input.documentKinds);
      const approved = to === 'SUBMITTED' ? true : input.documentsApproved;
      if (!kindsComplete || !approved) missing.push('documents');
    }
    if (requirement === 'payment' && !input.paymentApproved) missing.push('payment');
  }
  return missing;
}

/**
 * Requisitos em falta a partir de uma inscrição carregada com o perfil, os
 * documentos e a submissão de pagamento.
 */
export function enrollmentMissingRequirements(enrollment: {
  user: { name?: string | null; studentProfile?: ProfileLike };
  documents: readonly DocumentLike[];
  paymentSubmission?: { reviewStatus: DocumentReviewStatus } | null;
}): Array<'profile' | 'documents' | 'payment'> {
  return missingRequirements(requirementsOf(enrollment));
}

function requirementsOf(enrollment: {
  user: { name?: string | null; studentProfile?: ProfileLike };
  documents: readonly DocumentLike[];
  paymentSubmission?: { reviewStatus: DocumentReviewStatus } | null;
}): RequirementsInput {
  return {
    profileComplete: isProfileComplete(enrollment.user.studentProfile, enrollment.user.name),
    documentKinds: enrollment.documents.map((document) => document.kind),
    documentsApproved: hasApprovedDocuments(enrollment.documents),
    paymentApproved: enrollment.paymentSubmission?.reviewStatus === 'APPROVED',
  };
}

export const REQUIREMENT_LABELS: Record<'profile' | 'documents' | 'payment', string> = {
  profile: 'dados pessoais do perfil',
  documents: 'documentos aprovados',
  payment: 'comprovativo de pagamento aprovado',
};

function fail(code: TransitionCode, message: string): TransitionResult {
  return { ok: false, code, message };
}

/**
 * Único ponto de escrita do estado de uma inscrição. Grava o novo estado, o
 * histórico e o registo de auditoria na mesma transacção.
 */
export async function transitionEnrollment(input: {
  enrollmentId: string;
  to: EnrollmentStatus;
  actor: Actor;
  reason?: string;
}): Promise<TransitionResult> {
  const { enrollmentId, to, actor, reason } = input;

  const enrollment = await prisma.enrollment.findUnique({
    where: { id: enrollmentId },
    include: {
      user: { include: { studentProfile: true } },
      documents: true,
      paymentSubmission: true,
    },
  });

  if (!enrollment) return fail('NOT_ALLOWED', 'Inscrição não encontrada.');

  const previousStatus = enrollment.status as EnrollmentStatus;
  const from = legacyStatusToNew(previousStatus);
  const rule = findTransition(from, to);

  if (!rule) return fail('NOT_ALLOWED', `Transição não permitida de ${from} para ${to}.`);
  if (!rule.roles.includes(actor.role)) {
    return fail('FORBIDDEN', 'Sem permissão para executar esta transição.');
  }
  if (actor.role === 'STUDENT' && enrollment.userId !== actor.userId) {
    return fail('FORBIDDEN', 'Esta inscrição não lhe pertence.');
  }
  if (rule.requiresReason && !reason?.trim()) {
    return fail('NOT_ALLOWED', 'É obrigatório indicar o motivo desta transição.');
  }

  const requisitos = requirementsOf(enrollment);
  const missing =
    to === 'APPROVED'
      ? missingRequirements(requisitos)
      : unmetRequirements(to, rule.requires ?? [], requisitos);

  if (missing.length > 0) {
    const labels = missing.map((requirement) => REQUIREMENT_LABELS[requirement]);
    return fail('MISSING_REQUIREMENTS', `Faltam requisitos: ${labels.join(', ')}.`);
  }

  await prisma.$transaction(async (tx) => {
    await tx.enrollment.update({
      where: { id: enrollmentId },
      data: {
        status: to,
        ...(to === 'SUBMITTED' ? { submittedAt: new Date() } : {}),
      },
    });

    await tx.enrollmentStatusHistory.create({
      data: {
        enrollmentId,
        fromStatus: previousStatus,
        toStatus: to,
        actorUserId: actor.userId,
        actorRole: actor.role,
        reason: reason?.trim() || null,
      },
    });

    await tx.auditLog.create({
      data: {
        userId: actor.userId,
        action: 'enrollment.transition',
        entityType: 'enrollment',
        entityId: enrollmentId,
        metadata: { from: previousStatus, to, reason: reason?.trim() || null },
      },
    });
  });

  return { ok: true, to };
}
