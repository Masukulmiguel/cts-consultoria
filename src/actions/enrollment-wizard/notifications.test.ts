import { beforeEach, describe, expect, it, vi } from 'vitest';

const { prismaMock, authMock, notFoundMock } = vi.hoisted(() => ({
  prismaMock: {
    notification: { updateMany: vi.fn(), update: vi.fn() },
  },
  authMock: vi.fn(),
  notFoundMock: vi.fn(() => {
    throw new Error('NEXT_NOT_FOUND');
  }),
}));

vi.mock('@/lib/prisma', () => ({ prisma: prismaMock }));
vi.mock('@/lib/auth', () => ({ auth: authMock }));
vi.mock('next/navigation', () => ({ notFound: notFoundMock }));

import { markNotificationRead } from './notifications';

beforeEach(() => {
  vi.clearAllMocks();
  authMock.mockResolvedValue({ user: { id: 'u1', role: 'STUDENT' } });
  prismaMock.notification.updateMany.mockResolvedValue({ count: 1 });
});

describe('markNotificationRead', () => {
  it('marca a notificação como lida apenas se for do utilizador', async () => {
    await markNotificationRead('n1');

    const args = prismaMock.notification.updateMany.mock.calls[0][0];
    expect(args.where).toEqual({ id: 'n1', userId: 'u1' });
    expect(args.data).toEqual({ read: true });
  });

  it('lança erro quando não há sessão', async () => {
    authMock.mockResolvedValue(null);

    await expect(markNotificationRead('n1')).rejects.toThrow('NEXT_NOT_FOUND');
    expect(prismaMock.notification.updateMany).not.toHaveBeenCalled();
  });
});
