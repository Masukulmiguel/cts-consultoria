import { beforeEach, describe, expect, it, vi } from 'vitest';

const { prismaMock } = vi.hoisted(() => ({
  prismaMock: {
    enrollment: { findMany: vi.fn() },
  },
}));

vi.mock('@/lib/prisma', () => ({ prisma: prismaMock }));

import { listRows } from './content-repo';

beforeEach(() => {
  vi.clearAllMocks();
  prismaMock.enrollment.findMany.mockResolvedValue([]);
});

describe('listRows', () => {
  it('não inclui passwordHash ao listar inscrições', async () => {
    await listRows('enrollments');
    const args = prismaMock.enrollment.findMany.mock.calls[0][0];
    expect(args.include).toBeUndefined();
    expect(args.select).toMatchObject({
      id: true,
      user: { select: { id: true, name: true, email: true } },
      course: { select: { id: true, title: true, level: true } },
    });
    expect(JSON.stringify(args)).not.toContain('passwordHash');
  });
});
