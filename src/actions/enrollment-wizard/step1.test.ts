import { beforeEach, describe, expect, it, vi } from 'vitest';

const { prismaMock, txMock, authMock, notFoundMock } = vi.hoisted(() => {
  const tx = {
    user: { update: vi.fn() },
    studentProfile: { upsert: vi.fn() },
    enrollment: { update: vi.fn() },
  };
  return {
    prismaMock: {
      enrollment: { findUnique: vi.fn() },
      $transaction: vi.fn(async (callback: (client: typeof tx) => unknown) => callback(tx)),
    },
    txMock: tx,
    authMock: vi.fn(),
    notFoundMock: vi.fn(() => {
      throw new Error('NEXT_NOT_FOUND');
    }),
  };
});

vi.mock('@/lib/prisma', () => ({ prisma: prismaMock }));
vi.mock('@/lib/auth', () => ({ auth: authMock }));
vi.mock('next/navigation', () => ({ notFound: notFoundMock }));

import { saveStep1 } from './step1';

function inscricao(overrides: Record<string, unknown> = {}) {
  return {
    id: 'e1',
    userId: 'u1',
    status: 'DRAFT',
    currentStep: 1,
    user: {
      id: 'u1',
      name: 'Maria Silva',
      email: 'maria@cts.angola',
      studentProfile: null,
    },
    documents: [],
    ...overrides,
  };
}

function formData(values: Record<string, string>) {
  const data = new FormData();
  for (const [key, value] of Object.entries(values)) data.append(key, value);
  return data;
}

const validos = {
  primaryDocumentType: 'BI',
  nif: '',
  biNumber: '004512345LA041',
  fullName: 'Maria José Silva',
  birthDate: '1990-01-13',
  address: 'Rua Amílcar Cabral, 12',
  municipality: 'Luanda',
  province: 'Luanda',
  phone: '+244923000000',
  email: 'maria@cts.angola',
};

beforeEach(() => {
  vi.clearAllMocks();
  authMock.mockResolvedValue({ user: { id: 'u1', role: 'STUDENT' } });
  prismaMock.enrollment.findUnique.mockResolvedValue(inscricao());
  prismaMock.$transaction.mockImplementation(async (callback: (client: typeof txMock) => unknown) =>
    callback(txMock),
  );
});

describe('saveStep1', () => {
  it('rejeita dados inválidos devolvendo erros por campo e não escreve na BD', async () => {
    const resultado = await saveStep1('e1', null, formData({ ...validos, phone: 'abc' }));

    expect(resultado.ok).toBe(false);
    expect(resultado.errors?.phone).toBeTruthy();
    expect(prismaMock.$transaction).not.toHaveBeenCalled();
    expect(txMock.studentProfile.upsert).not.toHaveBeenCalled();
  });

  it('cria o perfil do dono e grava o passo 2', async () => {
    const resultado = await saveStep1('e1', null, formData(validos));

    expect(resultado).toEqual({ ok: true, nextStep: 2 });
    expect(txMock.studentProfile.upsert).toHaveBeenCalledTimes(1);
    const args = txMock.studentProfile.upsert.mock.calls[0][0];
    expect(args.where).toEqual({ userId: 'u1' });
    expect(args.create).toMatchObject({
      userId: 'u1',
      biNumber: '004512345LA041',
      municipality: 'Luanda',
      province: 'Luanda',
      phone: '+244923000000',
      primaryDocumentType: 'BI',
    });
    expect(args.create.birthDate).toBeInstanceOf(Date);
    expect(txMock.enrollment.update).toHaveBeenCalledWith({
      where: { id: 'e1' },
      data: { currentStep: 2 },
    });
  });

  it('actualiza o nome e o e-mail do dono', async () => {
    await saveStep1('e1', null, formData(validos));

    expect(txMock.user.update).toHaveBeenCalledWith({
      where: { id: 'u1' },
      data: { name: 'Maria José Silva', email: 'maria@cts.angola' },
    });
  });

  it('actualiza o perfil quando já existe', async () => {
    await saveStep1('e1', null, formData(validos));

    const args = txMock.studentProfile.upsert.mock.calls[0][0];
    expect(args.update).toMatchObject({ biNumber: '004512345LA041' });
  });

  it('lança erro quando a inscrição é de outro utilizador', async () => {
    prismaMock.enrollment.findUnique.mockResolvedValue(inscricao({ userId: 'outro' }));

    await expect(saveStep1('e1', null, formData(validos))).rejects.toThrow('NEXT_NOT_FOUND');
    expect(prismaMock.$transaction).not.toHaveBeenCalled();
  });

  it('nunca devolve passwordHash na resposta', async () => {
    const resultado = await saveStep1('e1', null, formData(validos));

    const resposta = JSON.stringify(resultado);
    expect(resposta).not.toContain('passwordHash');
    expect(resposta).not.toContain('totpSecretEnc');
    expect(resposta).not.toContain('sessionVersion');
  });

  it('devolve erro amigável quando o e-mail já está em uso', async () => {
    txMock.user.update.mockRejectedValueOnce({ code: 'P2002' });

    const resultado = await saveStep1('e1', null, formData(validos));

    expect(resultado.ok).toBe(false);
    expect(resultado.errors?.email).toBeTruthy();
  });
});
