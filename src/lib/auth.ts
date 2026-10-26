import { audit } from '@/lib/audit';
import { authConfig } from '@/lib/auth-config';
import { decryptSecret } from '@/lib/crypto';
import { verifyPassword } from '@/lib/password';
import { prisma } from '@/lib/prisma';
import { verifyTotp } from '@/lib/totp';
import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { z } from 'zod';

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
  totp: z.string().optional(),
});

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      credentials: { email: {}, password: {}, totp: {} },
      async authorize(credentials, req) {
        const parsed = credentialsSchema.safeParse(credentials);
        if (!parsed.success) return null;

        const { email, password, totp } = parsed.data;
        const ip = req?.headers?.get('x-forwarded-for')?.split(',')[0]?.trim() ?? null;

        const user = await prisma.user.findFirst({
          where: { email: email.toLowerCase(), deletedAt: null, isActive: true },
        });

        if (!user) {
          await audit({ action: 'login.failure', metadata: { email, reason: 'unknown_user' }, ip });
          return null;
        }

        const valid = await verifyPassword(password, user.passwordHash);
        if (!valid) {
          await audit({
            action: 'login.failure',
            userId: user.id,
            metadata: { reason: 'bad_password' },
            ip,
          });
          return null;
        }

        if (user.mfaEnabled) {
          if (!totp) {
            await audit({ action: 'login.mfa_required', userId: user.id, ip });
            return null;
          }
          if (!user.totpSecret) return null;
          const secret = decryptSecret(user.totpSecret);
          if (!verifyTotp(secret, totp)) {
            await audit({
              action: 'login.failure',
              userId: user.id,
              metadata: { reason: 'bad_totp' },
              ip,
            });
            return null;
          }
        }

        await audit({ action: 'login.success', userId: user.id, ip });

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          sessionVersion: user.sessionVersion,
        };
      },
    }),
  ],
});
