'use server';

import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';

/** Marca uma notificação do próprio utilizador como lida. */
export async function markNotificationRead(notificationId: string): Promise<void> {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) notFound();

  await prisma.notification.updateMany({
    where: { id: notificationId, userId },
    data: { read: true },
  });
}
