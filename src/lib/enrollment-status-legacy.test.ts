import { describe, expect, it } from 'vitest';
import { legacyStatusToNew } from './enrollment-status-legacy';

describe('legacyStatusToNew', () => {
  it('mapeia PENDING e PAID para PAYMENT_PENDING_VERIFICATION', () => {
    expect(legacyStatusToNew('PENDING')).toBe('PAYMENT_PENDING_VERIFICATION');
    expect(legacyStatusToNew('PAID')).toBe('PAYMENT_PENDING_VERIFICATION');
  });
  it('mapeia CONFIRMED e COMPLETED para APPROVED', () => {
    expect(legacyStatusToNew('CONFIRMED')).toBe('APPROVED');
    expect(legacyStatusToNew('COMPLETED')).toBe('APPROVED');
  });
  it('mantém CANCELLED', () => {
    expect(legacyStatusToNew('CANCELLED')).toBe('CANCELLED');
  });
  it('nunca produz estados inválidos', () => {
    expect(['APPROVED', 'PAYMENT_PENDING_VERIFICATION', 'CANCELLED']).toContain(
      legacyStatusToNew('PENDING'),
    );
  });
  it('preserva os estados canónicos sem alteração', () => {
    expect(legacyStatusToNew('DRAFT')).toBe('DRAFT');
    expect(legacyStatusToNew('PENDING_DOCUMENTS')).toBe('PENDING_DOCUMENTS');
    expect(legacyStatusToNew('SUBMITTED')).toBe('SUBMITTED');
    expect(legacyStatusToNew('UNDER_REVIEW')).toBe('UNDER_REVIEW');
    expect(legacyStatusToNew('CORRECTION_REQUIRED')).toBe('CORRECTION_REQUIRED');
    expect(legacyStatusToNew('PAYMENT_PENDING_VERIFICATION')).toBe('PAYMENT_PENDING_VERIFICATION');
    expect(legacyStatusToNew('APPROVED')).toBe('APPROVED');
    expect(legacyStatusToNew('REJECTED')).toBe('REJECTED');
  });
});
