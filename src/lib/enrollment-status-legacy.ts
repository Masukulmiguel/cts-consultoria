import type { EnrollmentStatus } from '@prisma/client';

/**
 * Estados canónicos do wizard (spec §4.6). São os únicos valores que o
 * frontend escreve; os estados legados são normalizados apenas em leitura.
 */
export const CANONICAL_ENROLLMENT_STATUSES = [
  'DRAFT',
  'PENDING_DOCUMENTS',
  'SUBMITTED',
  'UNDER_REVIEW',
  'CORRECTION_REQUIRED',
  'PAYMENT_PENDING_VERIFICATION',
  'APPROVED',
  'REJECTED',
  'CANCELLED',
] as const satisfies readonly EnrollmentStatus[];

/** Estados legados mantidos na base de dados e o seu estado canónico equivalente. */
export const LEGACY_ENROLLMENT_STATUS_MAP: Record<string, EnrollmentStatus> = {
  PENDING: 'PAYMENT_PENDING_VERIFICATION',
  PAID: 'PAYMENT_PENDING_VERIFICATION',
  CONFIRMED: 'APPROVED',
  COMPLETED: 'APPROVED',
  CANCELLED: 'CANCELLED',
};

const CANONICAL = new Set<string>(CANONICAL_ENROLLMENT_STATUSES);

/**
 * Normaliza um estado lido da base de dados para o vocabulário canónico.
 * Estados canónicos são devolvidos tal como estão; os legados são convertidos
 * segundo o mapa da spec §4.6. Valores desconhecidos caem no estado
 * "aguarda confirmação de pagamento" (nunca num estado aprovado).
 */
export function legacyStatusToNew(status: string): EnrollmentStatus {
  if (CANONICAL.has(status)) return status as EnrollmentStatus;
  return LEGACY_ENROLLMENT_STATUS_MAP[status] ?? 'PAYMENT_PENDING_VERIFICATION';
}
