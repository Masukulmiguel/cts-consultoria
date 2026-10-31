import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import type { UserRole } from '@prisma/client';

export class AuthError extends Error {
  constructor(
    public code: 'UNAUTHENTICATED' | 'FORBIDDEN' | 'REVOKED',
    message: string,
  ) {
    super(message);
  }
}

/**
 * Garante utilizador autenticado, activo e com sessão válida (anti-revogação).
 * Usar em server components/actions. A autorização é sempre verificada no servidor.
 */
export async function requireUser() {
  const session = await auth();
  const sessionUser = session?.user;
  if (!sessionUser?.id) throw new AuthError('UNAUTHENTICATED', 'Sessão inválida');

  const user = await prisma.user.findFirst({
    where: { id: sessionUser.id },
  });
  if (!user) throw new AuthError('UNAUTHENTICATED', 'Conta indisponível');

  if (user.sessionVersion !== sessionUser.sessionVersion) {
    throw new AuthError('REVOKED', 'Sessão revogada');
  }

  return user;
}

/** Garante que o utilizador pertence a um dos papéis indicados. */
export async function requireRole(...roles: UserRole[]) {
  const user = await requireUser();
  if (!roles.includes(user.role)) {
    throw new AuthError('FORBIDDEN', 'Sem permissão para esta operação');
  }
  return user;
}

/** Superadmin ou admin — acesso administrativo geral. */
export function requireAdmin() {
  return requireRole('SUPER_ADMIN', 'ADMIN');
}
