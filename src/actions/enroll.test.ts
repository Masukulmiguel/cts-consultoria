import { beforeEach, describe, expect, it, vi } from 'vitest';

const { prismaMock, auditMock, authMock, redirectMock } = vi.hoisted(() => ({
  prismaMock: {
    course: { findFirst: vi.fn() },
    enrollment: { upsert: vi.fn() },
  },
  auditMock: vi.fn(),
  authMock: vi.fn(),
  redirectMock: vi.fn(),
}));

vi.mock('@/lib/prisma', () => ({ prisma: prismaMock }));
vi.mock('@/lib/audit', () => ({ audit: auditMock }));
vi.mock('@/lib/auth', () => ({ auth: authMock }));
vi.mock('next/headers', () => ({ headers: vi.fn(async () => new Headers()) }));
vi.mock('next/navigation', () => ({ redirect: redirectMock }));

import { enrollInCourse } from './registration';

function formData(values: Record<string, string>) {
  const data = new FormData();
  for (const [key, value] of Object.entries(values)) data.append(key, value);
  return data;
}

beforeEach(() => {
  vi.clearAllMocks();
  authMock.mockResolvedValue({ user: { id: 'u1' } });
  prismaMock.course.findFirst.mockResolvedValue({ id: 'c1', title: 'Contabilidade' });
  prismaMock.enrollment.upsert.mockResolvedValue({ id: 'e1' });
});

describe('enrollInCourse', () => {
  it('cria a inscrição pendente e leva o formando à área do aluno', async () => {
    const result = await enrollInCourse(null, formData({ courseId: 'c1', locale: 'pt' }));

    expect(prismaMock.enrollment.upsert).toHaveBeenCalledTimes(1);
    const args = prismaMock.enrollment.upsert.mock.calls[0][0];
    expect(args.create).toMatchObject({ userId: 'u1', courseId: 'c1', status: 'PENDING' });
    expect(redirectMock).toHaveBeenCalledWith('/pt/aluno');
    expect(result).toEqual({ status: 'ok' });
  });

  it('exige sessão iniciada', async () => {
    authMock.mockResolvedValue(null);

    const result = await enrollInCourse(null, formData({ courseId: 'c1', locale: 'pt' }));

    expect(result?.status).toBe('error');
    expect(result?.status === 'error' && result.message).toContain('Inicie sessão');
    expect(prismaMock.enrollment.upsert).not.toHaveBeenCalled();
  });

  it('recusa um curso que já não está publicado', async () => {
    prismaMock.course.findFirst.mockResolvedValue(null);

    const result = await enrollInCourse(null, formData({ courseId: 'c1', locale: 'pt' }));

    expect(result?.status).toBe('error');
    expect(result?.status === 'error' && result.message).toContain('não está disponível');
    expect(prismaMock.enrollment.upsert).not.toHaveBeenCalled();
  });

  it('regista a auditoria da inscrição', async () => {
    await enrollInCourse(null, formData({ courseId: 'c1', locale: 'pt' }));

    expect(auditMock).toHaveBeenCalledTimes(1);
    expect(auditMock.mock.calls[0][0].action).toBe('enrollment.create');
  });
});
