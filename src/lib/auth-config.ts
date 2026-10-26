import type { NextAuthConfig } from 'next-auth';

/**
 * Configuração partilhada com o middleware (edge-safe: NÃO importar Prisma aqui).
 */
export const authConfig = {
  pages: {
    signIn: '/pt/admin/login',
  },
  session: {
    strategy: 'jwt',
    maxAge: 8 * 60 * 60, // 8 horas
  },
  providers: [],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.sessionVersion = user.sessionVersion;
        token.uid = user.id;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = (token.uid as string) ?? '';
        session.user.role = token.role as typeof session.user.role;
        session.user.sessionVersion = token.sessionVersion as number;
      }
      return session;
    },
  },
} satisfies NextAuthConfig;
