import { beforeEach, describe, expect, it, vi } from 'vitest';

const { prismaMock, authMock, notFoundMock } = vi.hoisted(() => ({
  prismaMock: {
    enrollment: { findUnique: vi.fn() },
    studentProfile: { upsert: vi.fn() },
  },
  authMock: vi.fn(),
  notFoundMock: vi.fn(() => {
    throw new Error('NEXT_NOT_FOUND');
  }),
}));

vi.mock('@/lib/prisma', () => ({ prisma: prismaMock }));
vi.mock('@/lib/auth', () => ({ auth: authMock }));
vi.mock('next/navigation', () => ({ notFound: notFoundMock }));

import { startOrResumeWizard } from './start';

function inscricao(overrides: Record<string, unknown> = {}) {
  return {
    id: 'e1',
    userId: 'u1',
    status: 'DRAFT',
    currentStep: 3,
    ...overrides,
  };
}

beforeEach(() => {
  vi.clearAllMocks();
  authMock.mockResolvedValue({ user: { id: 'u1', role: 'STUDENT' } });
  prismaMock.enrollment.findUnique.mockResolvedValue(inscricao());
  prismaMock.studentProfile.upsert.mockResolvedValue({ id: 'sp1', userId: 'u1' });
});

describe('startOrResumeWizard', () => {
  it('devolve o passo guardado e retoma onde ficou', async () => {
    const resultado = await startOrResumeWizard('e1');

    expect(resultado).toEqual({ step: 3 });
  });

  it('cria o StudentProfile vazio se ainda não existir', async () => {
    await startOrResumeWizard('e1');

    expect(prismaMock.studentProfile.upsert).toHaveBeenCalledTimes(1);
    const args = prismaMock.studentProfile.upsert.mock.calls[0][0];
    expect(args.where).toEqual({ userId: 'u1' });
    expect(args.create).toEqual({ userId: 'u1' });
  });

  it('devolve passo zero quando já não há wizard', async () => {
    prismaMock.enrollment.findUnique.mockResolvedValue(
      inscricao({ status: 'APPROVED', currentStep: 5 }),
    );

    expect(await startOrResumeWizard('e1')).toEqual({ step: 0 });
  });

  it('devolve passo zero também nos estados terminais', async () => {
    prismaMock.enrollment.findUnique.mockResolvedValue(
      inscricao({ status: 'REJECTED', currentStep: 5 }),
    );

    expect(await startOrResumeWizard('e1')).toEqual({ step: 0 });
  });

  it('não devolve segredos da conta', async () => {
    const resultado = await startOrResumeWizard('e1');

    const texto = JSON.stringify(resultado);
    expect(texto).not.toContain('passwordHash');
    expect(texto).not.toContain('totpSecretEnc');
  });

  it('lança erro quando a inscrição é de outro utilizador', async () => {
    prismaMock.enrollment.findUnique.mockResolvedValue(inscricao({ userId: 'outro' }));

    await expect(startOrResumeWizard('e1')).rejects.toThrow('NEXT_NOT_FOUND');
    expect(prismaMock.studentProfile.upsert).not.toHaveBeenCalled();
  });
});
