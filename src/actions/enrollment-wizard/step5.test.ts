import { beforeEach, describe, expect, it, vi } from 'vitest';

const { prismaMock, txMock, authMock, notFoundMock } = vi.hoisted(() => ({
  prismaMock: {
    enrollment: { findUnique: vi.fn(), update: vi.fn() },
    $transaction: vi.fn(),
  },
  txMock: {
    enrollment: { update: vi.fn() },
    enrollmentStatusHistory: { create: vi.fn() },
    auditLog: { create: vi.fn() },
  },
  authMock: vi.fn(),
  notFoundMock: vi.fn(() => {
    throw new Error('NEXT_NOT_FOUND');
  }),
}));

vi.mock('@/lib/prisma', () => ({ prisma: prismaMock }));
vi.mock('@/lib/auth', () => ({ auth: authMock }));
vi.mock('next/navigation', () => ({ notFound: notFoundMock }));

import { submitEnrollment } from './step5';

const DOCUMENTOS = [
  { kind: 'BI_FRONT' },
  { kind: 'BI_BACK' },
  { kind: 'PHOTO' },
  { kind: 'PROOF' },
];

function perfilCompleto() {
  return {
    nif: '123456789',
    biNumber: null,
    birthDate: new Date('1990-01-13T00:00:00.000Z'),
    address: 'Rua 1',
    municipality: 'Talatona',
    province: 'Luanda',
    phone: '+923000000',
  };
}

function inscricao(overrides: Record<string, unknown> = {}) {
  return {
    id: 'e1',
    userId: 'u1',
    courseId: 'c1',
    status: 'PENDING_DOCUMENTS',
    currentStep: 5,
    submittedAt: null,
    progress: 0,
    notes: null,
    user: {
      id: 'u1',
      name: 'Maria Silva',
      email: 'maria@cts.angola',
      studentProfile: perfilCompleto(),
    },
    documents: DOCUMENTOS,
    paymentSubmission: null,
    ...overrides,
  };
}

function formData(values: Record<string, string> = {}) {
  const data = new FormData();
  for (const [key, value] of Object.entries({ termsAccepted: 'on', ...values })) {
    data.append(key, value);
  }
  return data;
}

beforeEach(() => {
  vi.clearAllMocks();
  authMock.mockResolvedValue({ user: { id: 'u1', role: 'STUDENT' } });
  prismaMock.enrollment.findUnique.mockResolvedValue(inscricao());
  prismaMock.$transaction.mockImplementation(async (callback: (client: typeof txMock) => unknown) =>
    callback(txMock),
  );
});

describe('submitEnrollment', () => {
  it('exige os quatro documentos e diz o que falta', async () => {
    prismaMock.enrollment.findUnique.mockResolvedValue(
      inscricao({ documents: [{ kind: 'BI_FRONT' }, { kind: 'BI_BACK' }, { kind: 'PHOTO' }] }),
    );

    const resultado = await submitEnrollment('e1', null, formData());

    expect(resultado.ok).toBe(false);
    expect(resultado.message).toMatch(/comprovativo/i);
    expect(txMock.enrollmentStatusHistory.create).not.toHaveBeenCalled();
  });

  it('exige a aceitação dos termos', async () => {
    const resultado = await submitEnrollment('e1', null, formData({ termsAccepted: '' }));

    expect(resultado.ok).toBe(false);
    expect(resultado.errors?.terms).toBeTruthy();
    expect(txMock.enrollmentStatusHistory.create).not.toHaveBeenCalled();
  });

  it('submete a inscrição com histórico e data de submissão', async () => {
    const resultado = await submitEnrollment('e1', null, formData());

    expect(resultado.ok).toBe(true);
    expect(txMock.enrollment.update).toHaveBeenCalledTimes(1);
    const dados = txMock.enrollment.update.mock.calls[0][0].data;
    expect(dados.status).toBe('SUBMITTED');
    expect(dados.submittedAt).toBeInstanceOf(Date);
    expect(txMock.enrollmentStatusHistory.create).toHaveBeenCalledTimes(1);
    expect(txMock.enrollmentStatusHistory.create.mock.calls[0][0].data).toMatchObject({
      enrollmentId: 'e1',
      fromStatus: 'PENDING_DOCUMENTS',
      toStatus: 'SUBMITTED',
      actorUserId: 'u1',
      actorRole: 'STUDENT',
    });
  });

  it('rejeita a submissão sem perfil completo', async () => {
    prismaMock.enrollment.findUnique.mockResolvedValue(
      inscricao({
        user: {
          id: 'u1',
          name: 'Maria Silva',
          email: 'maria@cts.angola',
          studentProfile: { ...perfilCompleto(), phone: null },
        },
      }),
    );

    const resultado = await submitEnrollment('e1', null, formData());

    expect(resultado.ok).toBe(false);
    expect(resultado.message).toMatch(/perfil/i);
    expect(txMock.enrollment.update).not.toHaveBeenCalled();
    expect(txMock.enrollmentStatusHistory.create).not.toHaveBeenCalled();
  });

  it('não devolve dados sensíveis na resposta', async () => {
    const resultado = await submitEnrollment('e1', null, formData());

    const texto = JSON.stringify(resultado);
    expect(texto).not.toContain('123456789');
    expect(texto).not.toContain('004512345LA041');
    expect(texto).not.toContain('1990-01-13');
    expect(texto).not.toContain('maria@cts.angola');
  });

  it('lança erro quando a inscrição é de outro utilizador', async () => {
    prismaMock.enrollment.findUnique.mockResolvedValue(inscricao({ userId: 'outro' }));

    await expect(submitEnrollment('e1', null, formData())).rejects.toThrow('NEXT_NOT_FOUND');
    expect(txMock.enrollmentStatusHistory.create).not.toHaveBeenCalled();
  });
});
