import { routing } from '@/i18n/routing';
import { authConfig } from '@/lib/auth-config';
import NextAuth from 'next-auth';
import createIntlMiddleware from 'next-intl/middleware';

const intlMiddleware = createIntlMiddleware(routing);
const { auth: authMiddleware } = NextAuth(authConfig);

export default authMiddleware((req) => {
  const { nextUrl } = req;
  const isLogin = nextUrl.pathname.endsWith('/admin/login');
  const isAdmin = nextUrl.pathname.includes('/admin') && !isLogin;

  // Protecção de /admin no middleware (primeira linha de defesa).
  // A autorização por papel é re-verificada sempre no servidor (src/lib/rbac.ts).
  if (isAdmin && !req.auth) {
    const loginUrl = new URL('/pt/admin/login', nextUrl);
    loginUrl.searchParams.set('callbackUrl', nextUrl.pathname);
    return Response.redirect(loginUrl);
  }

  return intlMiddleware(req);
});

export const config = {
  // Middleware em todas as rotas de página, exceto API, assets e ficheiros estáticos.
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)'],
};
