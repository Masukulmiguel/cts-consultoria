import { beforeEach, describe, expect, it, vi } from 'vitest';

const { prismaMock, txMock } = vi.hoisted(() => {
  const tx = {
    enrollment: { update: vi.fn() },
    enrollmentStatusHistory: { create: vi.fn() },
    auditLog: { create: vi.fn() },
  };
  return {
    prismaMock: {
      enrollment: { findUnique: vi.fn() },
      $transaction: vi.fn(async (callback: (client: typeof tx) => unknown) => callback(tx)),
    },
    txMock: tx,
  };
});

vi.mock('@/lib/prisma', () => ({ prisma: prismaMock }));

import {
  TRANSITIONS,
  canTransition,
  missingRequirements,
  transitionEnrollment,
} from './enrollment-state';

const TODOS = ['BI_FRONT', 'BI_BACK', 'PHOTO', 'PROOF'] as const;

function documento(kind: (typeof TODOS)[number], reviewStatus = 'APPROVED') {
  return { id: `doc-${kind}`, kind, reviewStatus };
}

function inscricao(overrides: Record<string, unknown> = {}) {
  return {
    id: 'e1',
    userId: 'u1',
    status: 'DRAFT',
    user: {
      name: 'Maria Silva',
      studentProfile: {
        nif: '123456789',
        biNumber: null,
        birthDate: new Date('1990-01-13'),
        address: 'Rua Amílcar Cabral',
        municipality: 'Luanda',
        province: 'Luanda',
        phone: '+244923000000',
      },
    },
    documents: [],
    paymentSubmission: null,
    ...overrides,
  };
}

beforeEach(() => {
  vi.clearAllMocks();
  prismaMock.enrollment.findUnique.mockResolvedValue(inscricao());
  prismaMock.$transaction.mockImplementation(async (callback: (client: typeof txMock) => unknown) =>
    callback(txMock),
  );
});

describe('canTransition', () => {
  it('cobre cada par da tabela da spec com os papéis indicados', () => {
    for (const rule of TRANSITIONS) {
      for (const role of rule.roles) {
        expect(canTransition(rule.from === 'ANY' ? 'APPROVED' : rule.from, rule.to, role)).toBe(
          true,
        );
      }
    }
  });

  it('estudante envia DRAFT -> PENDING_DOCUMENTS', () => {
    expect(canTransition('DRAFT', 'PENDING_DOCUMENTS', 'STUDENT')).toBe(true);
  });

  it('estudante submete PENDING_DOCUMENTS -> SUBMITTED', () => {
    expect(canTransition('PENDING_DOCUMENTS', 'SUBMITTED', 'STUDENT')).toBe(true);
  });

  it('estudante NÃO pode ir para SUBMITTED directamente desde DRAFT', () => {
    expect(canTransition('DRAFT', 'SUBMITTED', 'STUDENT')).toBe(false);
  });

  it('estudante NÃO pode aprovar (APPROVED)', () => {
    expect(canTransition('PAYMENT_PENDING_VERIFICATION', 'APPROVED', 'STUDENT')).toBe(false);
  });

  it('SUPPORT NÃO pode confirmar pagamento nem aprovar', () => {
    expect(canTransition('UNDER_REVIEW', 'PAYMENT_PENDING_VERIFICATION', 'SUPPORT')).toBe(true);
    expect(canTransition('PAYMENT_PENDING_VERIFICATION', 'APPROVED', 'SUPPORT')).toBe(false);
  });

  it('ADMIN pode ir UNDER_REVIEW -> PAYMENT_PENDING_VERIFICATION', () => {
    expect(canTransition('UNDER_REVIEW', 'PAYMENT_PENDING_VERIFICATION', 'ADMIN')).toBe(true);
  });

  it('ADMIN pode recusar SUBMITTED', () => {
    expect(canTransition('SUBMITTED', 'REJECTED', 'ADMIN')).toBe(true);
  });

  it('qualquer estado pode ser cancelado pelo dono ou por ADMIN', () => {
    expect(canTransition('DRAFT', 'CANCELLED', 'STUDENT')).toBe(true);
    expect(canTransition('APPROVED', 'CANCELLED', 'ADMIN')).toBe(true);
    expect(canTransition('APPROVED', 'CANCELLED', 'SUPPORT')).toBe(false);
  });
});

describe('missingRequirements', () => {
  it('recusa APPROVED quando falta validação', () => {
    expect(
      missingRequirements({
        profileComplete: true,
        documentKinds: [...TODOS],
        documentsApproved: false,
        paymentApproved: true,
      }),
    ).toContain('documents');
  });

  it('exige perfil, documentos aprovados e pagamento', () => {
    expect(
      missingRequirements({
        profileComplete: false,
        documentKinds: [],
        documentsApproved: false,
        paymentApproved: false,
      }),
    ).toEqual(['profile', 'documents', 'payment']);
  });

  it('não devolve nada quando tudo está validado', () => {
    expect(
      missingRequirements({
        profileComplete: true,
        documentKinds: [...TODOS],
        documentsApproved: true,
        paymentApproved: true,
      }),
    ).toEqual([]);
  });
});

describe('transitionEnrollment', () => {
  it('estudante envia DRAFT -> PENDING_DOCUMENTS', async () => {
    const result = await transitionEnrollment({
      enrollmentId: 'e1',
      to: 'PENDING_DOCUMENTS',
      actor: { userId: 'u1', role: 'STUDENT' },
    });

    expect(result).toEqual({ ok: true, to: 'PENDING_DOCUMENTS' });
    expect(txMock.enrollment.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ status: 'PENDING_DOCUMENTS' }) }),
    );
  });

  it('estudante submete PENDING_DOCUMENTS -> SUBMITTED com perfil e 4 documentos', async () => {
    prismaMock.enrollment.findUnique.mockResolvedValue(
      inscricao({
        status: 'PENDING_DOCUMENTS',
        documents: TODOS.map((kind) => documento(kind, 'PENDING')),
      }),
    );

    const result = await transitionEnrollment({
      enrollmentId: 'e1',
      to: 'SUBMITTED',
      actor: { userId: 'u1', role: 'STUDENT' },
    });

    expect(result).toEqual({ ok: true, to: 'SUBMITTED' });
    expect(txMock.enrollment.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ status: 'SUBMITTED', submittedAt: expect.any(Date) }),
      }),
    );
  });

  it('estudante NÃO pode ir para SUBMITTED directamente desde DRAFT', async () => {
    const result = await transitionEnrollment({
      enrollmentId: 'e1',
      to: 'SUBMITTED',
      actor: { userId: 'u1', role: 'STUDENT' },
    });

    expect(result).toMatchObject({ ok: false, code: 'NOT_ALLOWED' });
    expect(prismaMock.$transaction).not.toHaveBeenCalled();
  });

  it('estudante NÃO pode aprovar (APPROVED)', async () => {
    prismaMock.enrollment.findUnique.mockResolvedValue(
      inscricao({
        status: 'PAYMENT_PENDING_VERIFICATION',
        documents: TODOS.map((kind) => documento(kind)),
        paymentSubmission: { id: 'p1', reviewStatus: 'APPROVED' },
      }),
    );

    const result = await transitionEnrollment({
      enrollmentId: 'e1',
      to: 'APPROVED',
      actor: { userId: 'u1', role: 'STUDENT' },
    });

    expect(result).toMatchObject({ ok: false, code: 'FORBIDDEN' });
    expect(prismaMock.$transaction).not.toHaveBeenCalled();
  });

  it('ADMIN pode ir UNDER_REVIEW -> PAYMENT_PENDING_VERIFICATION', async () => {
    prismaMock.enrollment.findUnique.mockResolvedValue(
      inscricao({ status: 'UNDER_REVIEW', documents: TODOS.map((kind) => documento(kind)) }),
    );

    const result = await transitionEnrollment({
      enrollmentId: 'e1',
      to: 'PAYMENT_PENDING_VERIFICATION',
      actor: { userId: 'admin', role: 'ADMIN' },
    });

    expect(result).toEqual({ ok: true, to: 'PAYMENT_PENDING_VERIFICATION' });
  });

  it('recusa APPROVED quando documentos ou pagamento não estão aprovados', async () => {
    prismaMock.enrollment.findUnique.mockResolvedValue(
      inscricao({
        status: 'PAYMENT_PENDING_VERIFICATION',
        documents: TODOS.map((kind) => documento(kind, 'PENDING')),
        paymentSubmission: { id: 'p1', reviewStatus: 'PENDING' },
      }),
    );

    const result = await transitionEnrollment({
      enrollmentId: 'e1',
      to: 'APPROVED',
      actor: { userId: 'admin', role: 'ADMIN' },
    });

    expect(result).toMatchObject({ ok: false, code: 'MISSING_REQUIREMENTS' });
    expect(prismaMock.$transaction).not.toHaveBeenCalled();
  });

  it('ADMIN pode recusar com reason obrigatório', async () => {
    prismaMock.enrollment.findUnique.mockResolvedValue(inscricao({ status: 'SUBMITTED' }));

    const semMotivo = await transitionEnrollment({
      enrollmentId: 'e1',
      to: 'REJECTED',
      actor: { userId: 'admin', role: 'ADMIN' },
    });
    expect(semMotivo).toMatchObject({ ok: false, code: 'NOT_ALLOWED' });

    const comMotivo = await transitionEnrollment({
      enrollmentId: 'e1',
      to: 'REJECTED',
      actor: { userId: 'admin', role: 'ADMIN' },
      reason: 'Documento ilegível',
    });
    expect(comMotivo).toEqual({ ok: true, to: 'REJECTED' });
  });

  it('gravar histórico com actorUserId e toStatus', async () => {
    await transitionEnrollment({
      enrollmentId: 'e1',
      to: 'PENDING_DOCUMENTS',
      actor: { userId: 'u1', role: 'STUDENT' },
      reason: 'início do wizard',
    });

    expect(txMock.enrollmentStatusHistory.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        enrollmentId: 'e1',
        fromStatus: 'DRAFT',
        toStatus: 'PENDING_DOCUMENTS',
        actorUserId: 'u1',
        actorRole: 'STUDENT',
        reason: 'início do wizard',
      }),
    });
  });

  it('grava o AuditLog do tipo enrollment na mesma transacção', async () => {
    await transitionEnrollment({
      enrollmentId: 'e1',
      to: 'PENDING_DOCUMENTS',
      actor: { userId: 'u1', role: 'STUDENT' },
    });

    expect(txMock.auditLog.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        userId: 'u1',
        action: 'enrollment.transition',
        entityType: 'enrollment',
        entityId: 'e1',
      }),
    });
  });

  it('formando não pode mover a inscrição de outro', async () => {
    const result = await transitionEnrollment({
      enrollmentId: 'e1',
      to: 'PENDING_DOCUMENTS',
      actor: { userId: 'outro', role: 'STUDENT' },
    });

    expect(result).toMatchObject({ ok: false, code: 'FORBIDDEN' });
    expect(prismaMock.$transaction).not.toHaveBeenCalled();
  });

  it('normaliza estados legados antes de validar a transição', async () => {
    prismaMock.enrollment.findUnique.mockResolvedValue(inscricao({ status: 'CONFIRMED' }));

    const result = await transitionEnrollment({
      enrollmentId: 'e1',
      to: 'CANCELLED',
      actor: { userId: 'admin', role: 'ADMIN' },
      reason: 'pedido do formando',
    });

    expect(result).toEqual({ ok: true, to: 'CANCELLED' });
    expect(txMock.enrollmentStatusHistory.create).toHaveBeenCalledWith({
      data: expect.objectContaining({ fromStatus: 'CONFIRMED', toStatus: 'CANCELLED' }),
    });
  });

  it('devolve NOT_ALLOWED quando a inscrição não existe', async () => {
    prismaMock.enrollment.findUnique.mockResolvedValue(null);

    const result = await transitionEnrollment({
      enrollmentId: 'e1',
      to: 'PENDING_DOCUMENTS',
      actor: { userId: 'u1', role: 'STUDENT' },
    });

    expect(result).toMatchObject({ ok: false, code: 'NOT_ALLOWED' });
  });
});
