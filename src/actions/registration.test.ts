import { beforeEach, describe, expect, it, vi } from 'vitest';

const { prismaMock, auditMock, signInMock } = vi.hoisted(() => ({
  prismaMock: {
    user: { findUnique: vi.fn(), create: vi.fn() },
    auditLog: { count: vi.fn() },
  },
  auditMock: vi.fn(),
  signInMock: vi.fn(),
}));

vi.mock('@/lib/prisma', () => ({ prisma: prismaMock }));
vi.mock('@/lib/audit', () => ({ audit: auditMock }));
vi.mock('@/lib/auth', () => ({ signIn: signInMock }));
vi.mock('next/headers', () => ({
  headers: vi.fn(
    async () =>
      new Headers({
        'x-forwarded-for': '203.0.113.9, 10.0.0.1',
        'user-agent': 'vitest',
      }),
  ),
}));

import { registerStudent } from './registration';

function formData(values: Record<string, string>) {
  const data = new FormData();
  for (const [key, value] of Object.entries(values)) data.append(key, value);
  return data;
}

const valid = {
  email: 'Maria@CTS.Angola',
  name: 'Maria Silva',
  password: 'segredo123',
  locale: 'pt',
};

beforeEach(() => {
  vi.clearAllMocks();
  prismaMock.user.findUnique.mockResolvedValue(null);
  prismaMock.user.create.mockImplementation(
    async ({ data }: { data: Record<string, unknown> }) => ({
      id: 'u1',
      ...data,
    }),
  );
  prismaMock.auditLog.count.mockResolvedValue(0);
  signInMock.mockResolvedValue(undefined);
});

describe('registerStudent', () => {
  it('cria a conta de formando na base de dados com a password cifrada', async () => {
    const result = await registerStudent(null, formData(valid));

    expect(result).toEqual({ status: 'ok' });
    expect(prismaMock.user.create).toHaveBeenCalledTimes(1);
    const data = prismaMock.user.create.mock.calls[0][0].data;
    expect(data.email).toBe('maria@cts.angola');
    expect(data.name).toBe('Maria Silva');
    expect(data.role).toBe('STUDENT');
    expect(data.locale).toBe('pt');
    expect(data.passwordHash).not.toBe('segredo123');
    expect(data.passwordHash).toMatch(/^\$2[aby]\$/);
  });

  it('inicia sessão depois de criar a conta', async () => {
    await registerStudent(null, formData(valid));

    expect(signInMock).toHaveBeenCalledWith('credentials', {
      email: 'maria@cts.angola',
      password: 'segredo123',
      redirect: false,
    });
  });

  it('recusa um email já registado sem criar utilizador', async () => {
    prismaMock.user.findUnique.mockResolvedValue({ id: 'u9', email: 'maria@cts.angola' });

    const result = await registerStudent(null, formData(valid));

    expect(result?.status).toBe('error');
    expect(result?.status === 'error' && result.message).toContain('já tem conta');
    expect(result?.status === 'error' && result.field).toBe('email');
    expect(prismaMock.user.create).not.toHaveBeenCalled();
  });

  it('bloqueia quando o limite de registos de 24 horas foi atingido', async () => {
    prismaMock.auditLog.count.mockResolvedValue(5);

    const result = await registerStudent(null, formData(valid));

    expect(result?.status).toBe('error');
    expect(result?.status === 'error' && result.message).toContain('Demasiadas');
    expect(prismaMock.user.create).not.toHaveBeenCalled();
  });

  it('devolve o campo inválido quando a palavra-passe é demasiado curta', async () => {
    const result = await registerStudent(null, formData({ ...valid, password: 'curta1' }));

    expect(result?.status).toBe('error');
    expect(result?.status === 'error' && result.field).toBe('password');
    expect(prismaMock.user.create).not.toHaveBeenCalled();
  });

  it('regista a auditoria do registo sem guardar a password', async () => {
    await registerStudent(null, formData(valid));

    expect(auditMock).toHaveBeenCalledTimes(1);
    const entry = auditMock.mock.calls[0][0];
    expect(entry.action).toBe('user.register');
    expect(entry.entityId).toBe('u1');
    expect(JSON.stringify(entry)).not.toContain('segredo123');
  });
});
