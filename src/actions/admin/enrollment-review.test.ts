import { beforeEach, describe, expect, it, vi } from 'vitest';

const { prismaMock, txMock, authMock, notFoundMock } = vi.hoisted(() => ({
  prismaMock: {
    user: { findFirst: vi.fn(), findUnique: vi.fn() },
    enrollment: { findUnique: vi.fn(), findFirst: vi.fn() },
    enrollmentDocument: { findFirst: vi.fn(), update: vi.fn() },
    paymentSubmission: { findUnique: vi.fn(), update: vi.fn() },
    notification: { create: vi.fn() },
    auditLog: { create: vi.fn() },
    $transaction: vi.fn(),
  },
  txMock: {
    enrollment: { update: vi.fn() },
    enrollmentStatusHistory: { create: vi.fn() },
    auditLog: { create: vi.fn() },
    enrollmentDocument: { update: vi.fn() },
    paymentSubmission: { update: vi.fn() },
    notification: { create: vi.fn() },
  },
  authMock: vi.fn(),
  notFoundMock: vi.fn(() => {
    throw new Error('NEXT_NOT_FOUND');
  }),
}));

vi.mock('@/lib/prisma', () => ({ prisma: prismaMock }));
vi.mock('@/lib/auth', () => ({ auth: authMock }));
vi.mock('next/navigation', () => ({ notFound: notFoundMock }));

import {
  approveEnrollment,
  assignReviewer,
  rejectEnrollment,
  requestCorrection,
  reviewDocument,
  reviewPayment,
} from './enrollment-review';

function utilizador(role = 'ADMIN') {
  return {
    id: 'admin1',
    name: 'Administrador',
    email: 'admin@cts.angola',
    role,
    sessionVersion: 1,
  };
}

function inscricao(overrides: Record<string, unknown> = {}) {
  return {
    id: 'e1',
    userId: 'u1',
    status: 'UNDER_REVIEW',
    currentStep: 5,
    user: {
      id: 'u1',
      name: 'Maria Silva',
      email: 'maria@cts.angola',
      studentProfile: {
        nif: '123456789',
        biNumber: null,
        birthDate: new Date('1990-01-13T00:00:00.000Z'),
        address: 'Rua 1',
        municipality: 'Talatona',
        province: 'Luanda',
        phone: '+923000000',
      },
    },
    documents: [
      { id: 'd1', kind: 'BI_FRONT', reviewStatus: 'APPROVED' },
      { id: 'd2', kind: 'BI_BACK', reviewStatus: 'APPROVED' },
      { id: 'd3', kind: 'PHOTO', reviewStatus: 'APPROVED' },
      { id: 'd4', kind: 'PROOF', reviewStatus: 'APPROVED' },
    ],
    paymentSubmission: { id: 'p1', reviewStatus: 'APPROVED' },
    ...overrides,
  };
}

beforeEach(() => {
  vi.clearAllMocks();
  authMock.mockResolvedValue({ user: { id: 'admin1', role: 'ADMIN', sessionVersion: 1 } });
  prismaMock.user.findFirst.mockResolvedValue(utilizador());
  prismaMock.user.findUnique.mockResolvedValue(utilizador('SUPPORT'));
  prismaMock.enrollment.findUnique.mockResolvedValue(inscricao());
  prismaMock.enrollment.findFirst.mockResolvedValue(inscricao());
  prismaMock.enrollmentDocument.findFirst.mockResolvedValue({
    id: 'd1',
    enrollmentId: 'e1',
    kind: 'BI_FRONT',
    reviewStatus: 'PENDING',
  });
  prismaMock.paymentSubmission.findUnique.mockResolvedValue({
    id: 'p1',
    enrollmentId: 'e1',
    reviewStatus: 'PENDING',
  });
  prismaMock.notification.create.mockResolvedValue({ id: 'n1' });
  prismaMock.auditLog.create.mockResolvedValue({ id: 'a1' });
  prismaMock.$transaction.mockImplementation(async (callback: (client: typeof txMock) => unknown) =>
    callback(txMock),
  );
});

describe('reviewDocument', () => {
  it('exige um papel de revisão', async () => {
    prismaMock.user.findFirst.mockResolvedValue(utilizador('STUDENT'));

    await expect(
      reviewDocument({ enrollmentId: 'e1', documentId: 'd1', decision: 'APPROVED' }),
    ).rejects.toThrow();
    expect(prismaMock.enrollmentDocument.update).not.toHaveBeenCalled();
  });

  it('grava a decisão, o revisor e a auditoria', async () => {
    const resultado = await reviewDocument({
      enrollmentId: 'e1',
      documentId: 'd1',
      decision: 'REJECTED',
      reason: 'Documento ilegível',
    });

    expect(resultado.ok).toBe(true);
    const args = txMock.enrollmentDocument.update.mock.calls[0][0];
    expect(args.data).toMatchObject({
      reviewStatus: 'REJECTED',
      reviewedById: 'admin1',
      rejectionReason: 'Documento ilegível',
    });
    const auditoria = txMock.auditLog.create.mock.calls[0][0];
    expect(auditoria.data).toMatchObject({
      userId: 'admin1',
      entityType: 'enrollment',
      entityId: 'e1',
    });
  });
});

describe('reviewPayment', () => {
  it('não deixa o papel SUPPORT aprovar o pagamento', async () => {
    prismaMock.user.findFirst.mockResolvedValue(utilizador('SUPPORT'));

    const resultado = await reviewPayment({ enrollmentId: 'e1', decision: 'APPROVED' });

    expect(resultado.ok).toBe(false);
    expect(resultado.message).toBeTruthy();
    expect(prismaMock.paymentSubmission.update).not.toHaveBeenCalled();
  });

  it('permite ao SUPPORT registar uma rejeição', async () => {
    prismaMock.user.findFirst.mockResolvedValue(utilizador('SUPPORT'));

    const resultado = await reviewPayment({
      enrollmentId: 'e1',
      decision: 'REJECTED',
      reason: 'Valor divergente',
    });

    expect(resultado.ok).toBe(true);
    const args = txMock.paymentSubmission.update.mock.calls[0][0];
    expect(args.data).toMatchObject({
      reviewStatus: 'REJECTED',
      reviewedById: 'admin1',
      rejectionReason: 'Valor divergente',
    });
  });
});

describe('approveEnrollment', () => {
  it('fala com a lista de requisitos em falta', async () => {
    prismaMock.enrollment.findUnique.mockResolvedValue(
      inscricao({
        status: 'PAYMENT_PENDING_VERIFICATION',
        documents: [{ id: 'd1', kind: 'BI_FRONT', reviewStatus: 'PENDING' }],
        paymentSubmission: { id: 'p1', reviewStatus: 'PENDING' },
      }),
    );

    const resultado = await approveEnrollment({ enrollmentId: 'e1' });

    expect(resultado.ok).toBe(false);
    expect(resultado.message).toMatch(/documentos/i);
    expect(resultado.message).toMatch(/pagamento/i);
    expect(txMock.enrollment.update).not.toHaveBeenCalled();
  });

  it('aprova quando os requisitos estão cumpridos', async () => {
    prismaMock.enrollment.findUnique.mockResolvedValue(
      inscricao({ status: 'PAYMENT_PENDING_VERIFICATION' }),
    );

    const resultado = await approveEnrollment({ enrollmentId: 'e1' });

    expect(resultado.ok).toBe(true);
    expect(txMock.enrollment.update.mock.calls[0][0].data.status).toBe('APPROVED');
  });
});

describe('requestCorrection', () => {
  it('exige uma mensagem não vazia', async () => {
    const resultado = await requestCorrection({
      enrollmentId: 'e1',
      fields: ['address'],
      message: '   ',
    });

    expect(resultado.ok).toBe(false);
    expect(txMock.enrollmentStatusHistory.create).not.toHaveBeenCalled();
  });

  it('muda para CORRECTION_REQUIRED com histórico e notifica o formando', async () => {
    const resultado = await requestCorrection({
      enrollmentId: 'e1',
      fields: ['address', 'phone'],
      message: 'O endereço não está legível.',
    });

    expect(resultado.ok).toBe(true);
    expect(txMock.enrollment.update.mock.calls[0][0].data.status).toBe('CORRECTION_REQUIRED');
    expect(txMock.enrollmentStatusHistory.create.mock.calls[0][0].data).toMatchObject({
      fromStatus: 'UNDER_REVIEW',
      toStatus: 'CORRECTION_REQUIRED',
      actorUserId: 'admin1',
    });
    expect(prismaMock.notification.create).toHaveBeenCalledTimes(1);
  });
});

describe('rejectEnrollment', () => {
  it('exige um motivo', async () => {
    const resultado = await rejectEnrollment({ enrollmentId: 'e1', reason: '' });

    expect(resultado.ok).toBe(false);
    expect(txMock.enrollment.update).not.toHaveBeenCalled();
  });

  it('rejeita a inscrição com histórico', async () => {
    const resultado = await rejectEnrollment({ enrollmentId: 'e1', reason: 'Documento falso' });

    expect(resultado.ok).toBe(true);
    expect(txMock.enrollment.update.mock.calls[0][0].data.status).toBe('REJECTED');
  });
});

describe('assignReviewer', () => {
  it('regista a atribuição em auditoria e notifica o revisor', async () => {
    prismaMock.user.findFirst.mockResolvedValue(utilizador('SUPPORT'));

    const resultado = await assignReviewer({ enrollmentId: 'e1', reviewerId: 'admin2' });

    expect(resultado.ok).toBe(true);
    const auditoria = txMock.auditLog.create.mock.calls[0][0];
    expect(auditoria.data).toMatchObject({
      userId: 'admin1',
      entityType: 'enrollment',
      entityId: 'e1',
    });
    expect(txMock.notification.create).toHaveBeenCalledTimes(1);
  });
});

describe('respostas das acções', () => {
  it('nunca devolvem segredos da conta', async () => {
    const resultados = await Promise.all([
      reviewDocument({ enrollmentId: 'e1', documentId: 'd1', decision: 'APPROVED' }),
      reviewPayment({ enrollmentId: 'e1', decision: 'REJECTED', reason: 'x' }),
      approveEnrollment({ enrollmentId: 'e1' }),
      rejectEnrollment({ enrollmentId: 'e1', reason: 'x' }),
    ]);

    const texto = JSON.stringify(resultados);
    expect(texto).not.toContain('passwordHash');
    expect(texto).not.toContain('totpSecretEnc');
  });
});
