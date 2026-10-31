'use server';

import { audit } from '@/lib/audit';
import { verifyPassword } from '@/lib/password';
import { prisma } from '@/lib/prisma';
import { rateLimit } from '@/lib/rate-limit';
import { z } from 'zod';

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export type LoginCheckResult = 'ok' | 'mfa' | 'invalid' | 'rate_limited';

/**
 * Passo 1 do login (pré-verificação): indica ao cliente se é necessário código MFA.
 * A autorização final é feita pelo authorize() do Auth.js — esta acção não cria sessão.
 */
export async function checkCredentials(input: {
  email: string;
  password: string;
}): Promise<LoginCheckResult> {
  const parsed = schema.safeParse(input);
  if (!parsed.success) return 'invalid';

  const email = parsed.data.email.toLowerCase();
  const limited = rateLimit(`login:${email}`, 5, 5 * 60_000);
  if (!limited.ok) {
    await audit({ action: 'login.rate_limited', metadata: { email } });
    return 'rate_limited';
  }

  const user = await prisma.user.findFirst({
    where: { email },
    select: { id: true, passwordHash: true, totpEnabled: true },
  });

  if (!user) {
    await audit({ action: 'login.failure', metadata: { email, reason: 'unknown_user' } });
    return 'invalid';
  }

  const valid = await verifyPassword(parsed.data.password, user.passwordHash);
  if (!valid) {
    await audit({ action: 'login.failure', userId: user.id, metadata: { reason: 'bad_password' } });
    return 'invalid';
  }

  return user.totpEnabled ? 'mfa' : 'ok';
}
