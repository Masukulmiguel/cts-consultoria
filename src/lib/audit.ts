import { prisma } from '@/lib/prisma';
import type { Prisma } from '@prisma/client';

type AuditEntry = {
  userId?: string | null;
  action: string;
  entity?: string;
  entityId?: string;
  metadata?: Record<string, unknown>;
  ip?: string | null;
  userAgent?: string | null;
};

/**
 * Registo de auditoria. Nunca registar palavras-passe, tokens ou dados sensíveis.
 */
export async function audit(entry: AuditEntry) {
  try {
    await prisma.auditLog.create({
      data: {
        userId: entry.userId ?? null,
        action: entry.action,
        entity: entry.entity,
        entityId: entry.entityId,
        metadata: (entry.metadata as Prisma.InputJsonObject | undefined) ?? undefined,
        ip: entry.ip ?? null,
        userAgent: entry.userAgent ?? null,
      },
    });
  } catch (err) {
    // A auditoria nunca deve derrubar a operação principal, mas a falha deve ser visível.
    console.error('[audit] falha ao registar auditoria', err);
  }
}
