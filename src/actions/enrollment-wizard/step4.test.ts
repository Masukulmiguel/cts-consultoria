import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const { prismaMock, txMock, authMock, notFoundMock, uploadMock, settingsMock } = vi.hoisted(() => {
  const upload = vi.fn(async () => ({ data: { path: 'u1/e1/PROOF' }, error: null }));
  return {
    prismaMock: {
      enrollment: { findUnique: vi.fn(), update: vi.fn() },
      course: { findUnique: vi.fn() },
      enrollmentDocument: { upsert: vi.fn() },
      paymentSubmission: { findFirst: vi.fn(), upsert: vi.fn() },
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
    uploadMock: upload,
    settingsMock: vi.fn(),
  };
});

vi.mock('@/lib/prisma', () => ({ prisma: prismaMock }));
vi.mock('@/lib/auth', () => ({ auth: authMock }));
vi.mock('next/navigation', () => ({ notFound: notFoundMock }));
vi.mock('@/lib/payment-settings', () => ({ getPaymentSettings: settingsMock }));
vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(() => ({ storage: { from: vi.fn(() => ({ upload: uploadMock })) } })),
}));

import { saveStep4 } from './step4';

const jpeg = new Uint8Array([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10]);
const png = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

function inscricao(overrides: Record<string, unknown> = {}) {
  return {
    id: 'e1',
    userId: 'u1',
    courseId: 'c1',
    status: 'DRAFT',
    currentStep: 4,
    submittedAt: null,
    progress: 0,
    notes: null,
    user: {
      id: 'u1',
      name: 'Maria Silva',
      email: 'maria@cts.angola',
      studentProfile: {
        nif: null,
        biNumber: '004512345LA041',
        birthDate: new Date('1990-01-13T00:00:00.000Z'),
        address: 'Rua 1',
        municipality: 'Talatona',
        province: 'Luanda',
        phone: '+923000000',
      },
    },
    documents: [],
    paymentSubmission: null,
    ...overrides,
  };
}

function curso(price: string | null = '75000.00') {
  return { id: 'c1', title: 'Informática', family: 'Tecnologia', price };
}

function formData(values: Record<string, string>, ficheiro?: File) {
  const data = new FormData();
  for (const [key, value] of Object.entries(values)) data.append(key, value);
  if (ficheiro) data.append('file', ficheiro);
  return data;
}

function dadosValidos(extra: Record<string, string> = {}) {
  return {
    method: 'BANK_TRANSFER',
    amount: '75000',
    reference: 'TRX-123456',
    paymentDate: '2026-12-01',
    ...extra,
  };
}

beforeEach(() => {
  vi.clearAllMocks();
  vi.stubEnv('SUPABASE_URL', 'https://project.supabase.co');
  vi.stubEnv('SUPABASE_SERVICE_ROLE_KEY', 'service-role-key');
  authMock.mockResolvedValue({ user: { id: 'u1', role: 'STUDENT' } });
  prismaMock.enrollment.findUnique.mockResolvedValue(inscricao());
  prismaMock.course.findUnique.mockResolvedValue(curso());
  prismaMock.paymentSubmission.findFirst.mockResolvedValue(null);
  prismaMock.$transaction.mockImplementation(async (callback: (client: typeof txMock) => unknown) =>
    callback(txMock),
  );
  settingsMock.mockResolvedValue({
    bank: 'Banco Exemplo, IBAN AO06 0000 0000 0000 0000 0000 0',
    express: 'Multicaixa Express',
    instructions: 'Pague e envie o comprovativo.',
  });
  uploadMock.mockResolvedValue({ data: { path: 'u1/e1/PROOF' }, error: null });
});

afterEach(() => {
  vi.unstubAllEnvs();
});

describe('saveStep4', () => {
  it('usa o preço do curso da BD e ignora o valor enviado pelo cliente', async () => {
    const resultado = await saveStep4('e1', null, formData(dadosValidos({ amount: '1' })));

    expect(resultado.ok).toBe(true);
    expect(prismaMock.course.findUnique).toHaveBeenCalledTimes(1);
    const args = prismaMock.paymentSubmission.upsert.mock.calls[0][0];
    expect(Number(args.create.amount)).toBe(75000);
  });

  it('sinaliza valor divergente sem aprovar a inscrição', async () => {
    const resultado = await saveStep4(
      'e1',
      null,
      formData(dadosValidos({ ocrValue: '70.000,00' })),
    );

    expect(resultado.message).toMatch(/divergente/i);
    const args = prismaMock.paymentSubmission.upsert.mock.calls[0][0];
    expect(args.create.reviewStatus).toBe('DIVERGENT');

    const chamadas = prismaMock.enrollment.update.mock.calls;
    for (const [dados] of chamadas as unknown as Array<[{ data: { status?: string } }]>) {
      expect(dados.data.status).not.toBe('APPROVED');
    }
    const transicoes = txMock.enrollment.update.mock.calls;
    for (const [dados] of transicoes as unknown as Array<[{ data: { status?: string } }]>) {
      expect(dados.data.status).not.toBe('APPROVED');
    }
  });

  it('rejeita um comprovativo já utilizado noutra inscrição sem gravar nada', async () => {
    prismaMock.paymentSubmission.findFirst.mockResolvedValue({
      id: 'p2',
      enrollmentId: 'e2',
      duplicateCheckHash: 'hash',
    });

    const resultado = await saveStep4('e1', null, formData(dadosValidos()));

    expect(resultado.ok).toBe(false);
    expect(resultado.message).toContain('já utilizado');
    expect(prismaMock.paymentSubmission.upsert).not.toHaveBeenCalled();
    expect(prismaMock.enrollment.update).not.toHaveBeenCalled();
    expect(prismaMock.enrollmentDocument.upsert).not.toHaveBeenCalled();
  });

  it('avisa quando os dados de pagamento ainda não estão configurados', async () => {
    settingsMock.mockResolvedValue({ bank: null, express: null, instructions: null });

    const resultado = await saveStep4('e1', null, formData(dadosValidos()));

    expect(resultado.ok).toBe(false);
    expect(resultado.message).toMatch(/dados de pagamento em configuração/i);
    expect(resultado.message).not.toMatch(/AO06/i);
    expect(prismaMock.paymentSubmission.upsert).not.toHaveBeenCalled();
  });

  it('conclui a etapa com a transição DRAFT para PENDING_DOCUMENTS e histórico', async () => {
    const resultado = await saveStep4('e1', null, formData(dadosValidos()));

    expect(resultado.ok).toBe(true);
    expect(resultado.nextStep).toBe(5);
    expect(txMock.enrollment.update).toHaveBeenCalledTimes(1);
    expect(txMock.enrollment.update.mock.calls[0][0].data.status).toBe('PENDING_DOCUMENTS');
    expect(txMock.enrollmentStatusHistory.create).toHaveBeenCalledTimes(1);
    expect(txMock.enrollmentStatusHistory.create.mock.calls[0][0].data).toMatchObject({
      enrollmentId: 'e1',
      fromStatus: 'DRAFT',
      toStatus: 'PENDING_DOCUMENTS',
      actorUserId: 'u1',
      actorRole: 'STUDENT',
    });
  });

  it('guarda o comprovativo com o kind PROOF e o sha256 do ficheiro', async () => {
    const ficheiro = new File([jpeg], 'comprovativo.jpg', { type: 'image/jpeg' });

    const resultado = await saveStep4('e1', null, formData(dadosValidos(), ficheiro));

    expect(resultado.ok).toBe(true);
    const [chave] = uploadMock.mock.calls[0] as unknown as [string];
    expect(chave).toBe('u1/e1/PROOF');
    const args = prismaMock.enrollmentDocument.upsert.mock.calls[0][0];
    expect(args.create).toMatchObject({
      enrollmentId: 'e1',
      kind: 'PROOF',
      storageKey: 'u1/e1/PROOF',
      reviewStatus: 'PENDING',
    });
    expect(args.create.sha256).toMatch(/^[a-f0-9]{64}$/);
  });

  it('nunca marca o pagamento como aprovado automaticamente', async () => {
    await saveStep4('e1', null, formData(dadosValidos({ ocrValue: '75.000,00' })));

    const args = prismaMock.paymentSubmission.upsert.mock.calls[0][0];
    expect(args.create.reviewStatus).toBe('PENDING');
    expect(args.create.reviewStatus).not.toBe('APPROVED');
    expect(args.create.reviewStatus).not.toBe('MATCHED');
  });

  it('rejeita um método de pagamento desconhecido', async () => {
    const resultado = await saveStep4('e1', null, formData(dadosValidos({ method: 'BITCOIN' })));

    expect(resultado.ok).toBe(false);
    expect(resultado.errors?.method).toBeTruthy();
    expect(prismaMock.paymentSubmission.upsert).not.toHaveBeenCalled();
  });

  it('rejeita uma data de pagamento inválida', async () => {
    const resultado = await saveStep4(
      'e1',
      null,
      formData(dadosValidos({ paymentDate: '01-12-2026' })),
    );

    expect(resultado.ok).toBe(false);
    expect(resultado.errors?.paymentDate).toBeTruthy();
    expect(prismaMock.paymentSubmission.upsert).not.toHaveBeenCalled();
  });

  it('rejeita um comprovativo cujos magic bytes não correspondem ao tipo declarado', async () => {
    const ficheiro = new File([png], 'comprovativo.jpg', { type: 'image/jpeg' });

    const resultado = await saveStep4('e1', null, formData(dadosValidos(), ficheiro));

    expect(resultado.ok).toBe(false);
    expect(resultado.errors?.file).toMatch(/não corresponde ao tipo declarado/i);
    expect(uploadMock).not.toHaveBeenCalled();
    expect(prismaMock.paymentSubmission.upsert).not.toHaveBeenCalled();
  });

  it('lança erro quando a inscrição é de outro utilizador', async () => {
    prismaMock.enrollment.findUnique.mockResolvedValue(inscricao({ userId: 'outro' }));

    await expect(saveStep4('e1', null, formData(dadosValidos()))).rejects.toThrow('NEXT_NOT_FOUND');
    expect(prismaMock.paymentSubmission.upsert).not.toHaveBeenCalled();
  });
});
