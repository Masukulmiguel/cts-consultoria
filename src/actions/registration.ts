'use server';

import { createHash } from 'node:crypto';
import { audit } from '@/lib/audit';
import { auth, signIn } from '@/lib/auth';
import { hashPassword } from '@/lib/password';
import { prisma } from '@/lib/prisma';
import { type RegistrationState, normalizeEmail, registrationSchema } from '@/lib/registration';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';

const MESSAGES = {
  pt: {
    emailTaken: 'Esse email já tem conta. Use "Já tenho conta" para entrar.',
    emailInvalid: 'O e-mail indicado não é válido.',
    nameInvalid: 'Indique o seu nome (2 a 80 caracteres).',
    passwordInvalid: 'A palavra-passe precisa de pelo menos 8 caracteres.',
    rateLimit: 'Demasiadas tentativas de registo. Tente novamente mais tarde.',
    generic: 'Não foi possível criar a conta. Tente novamente.',
    signInRequired: 'Inicie sessão para confirmar a inscrição.',
    courseUnavailable: 'Esta formação já não está disponível para inscrição.',
  },
  en: {
    emailTaken: 'This email already has an account. Use "I already have an account" to sign in.',
    emailInvalid: 'The email address is invalid.',
    nameInvalid: 'Enter your name (2 to 80 characters).',
    passwordInvalid: 'The password needs at least 8 characters.',
    rateLimit: 'Too many registration attempts. Please try again later.',
    generic: 'Could not create the account. Please try again.',
    signInRequired: 'Sign in to confirm your enrolment.',
    courseUnavailable: 'This programme is no longer open for enrolment.',
  },
} as const;

const REGISTER_WINDOW_MS = 24 * 60 * 60 * 1000;
const REGISTER_LIMIT = 5;

function detectLocale(value: string | null): 'pt' | 'en' {
  return value === 'en' ? 'en' : 'pt';
}

/**
 * Cria a conta de um formando directamente na base de dados.
 * A palavra-passe é cifrada (bcrypt) e nunca é guardada em claro nem registada em auditoria.
 * Limite persistente de registos por IP e por email nas últimas 24 horas.
 */
export async function registerStudent(
  _prev: RegistrationState,
  formData: FormData,
): Promise<RegistrationState> {
  const locale = detectLocale(String(formData.get('locale') ?? ''));
  const t = MESSAGES[locale];

  const email = String(formData.get('email') ?? '');
  const name = String(formData.get('name') ?? '');
  const password = String(formData.get('password') ?? '');

  const parsed = registrationSchema.safeParse({ email, name, password });
  if (!parsed.success) {
    const field = parsed.error.issues[0]?.path[0];
    if (field === 'email') return { status: 'error', message: t.emailInvalid, field: 'email' };
    if (field === 'name') return { status: 'error', message: t.nameInvalid, field: 'name' };
    return { status: 'error', message: t.passwordInvalid, field: 'password' };
  }

  const normalizedEmail = normalizeEmail(parsed.data.email);

  const h = await headers();
  const ip = h.get('x-forwarded-for')?.split(',')[0]?.trim() ?? h.get('x-real-ip') ?? 'unknown';
  const ipHash = createHash('sha256')
    .update(`${ip}:${process.env.AUTH_SECRET ?? 'dev'}`)
    .digest('hex');

  const since = new Date(Date.now() - REGISTER_WINDOW_MS);
  const [byIp, byEmail] = await Promise.all([
    prisma.auditLog.count({
      where: {
        action: 'user.register',
        createdAt: { gte: since },
        metadata: { path: ['ipHash'], equals: ipHash },
      },
    }),
    prisma.auditLog.count({
      where: {
        action: 'user.register',
        createdAt: { gte: since },
        metadata: { path: ['email'], equals: normalizedEmail },
      },
    }),
  ]);

  if (byIp >= REGISTER_LIMIT || byEmail >= REGISTER_LIMIT) {
    return { status: 'error', message: t.rateLimit };
  }

  const existing = await prisma.user.findUnique({
    where: { email: normalizedEmail },
    select: { id: true },
  });
  if (existing) {
    return { status: 'error', message: t.emailTaken, field: 'email' };
  }

  let user: { id: string };
  try {
    user = await prisma.user.create({
      data: {
        email: normalizedEmail,
        name: parsed.data.name,
        passwordHash: await hashPassword(parsed.data.password),
        role: 'STUDENT',
        locale,
      },
      select: { id: true, email: true },
    });
  } catch {
    return { status: 'error', message: t.generic };
  }

  await audit({
    action: 'user.register',
    entity: 'user',
    entityId: user.id,
    metadata: { ipHash, email: normalizedEmail },
    ip,
    userAgent: h.get('user-agent')?.slice(0, 300),
  });

  try {
    await signIn('credentials', {
      email: normalizedEmail,
      password: parsed.data.password,
      redirect: false,
    });
  } catch {
    return { status: 'error', message: t.generic };
  }

  return { status: 'ok' };
}

/**
 * Confirma a inscrição do formando numa formação publicada.
 * A inscrição nasce em PENDING (aguarda pagamento validado pelo admin).
 */
export async function enrollInCourse(
  _prev: RegistrationState,
  formData: FormData,
): Promise<RegistrationState> {
  const locale = detectLocale(String(formData.get('locale') ?? ''));
  const t = MESSAGES[locale];

  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) {
    return { status: 'error', message: t.signInRequired };
  }

  const courseId = String(formData.get('courseId') ?? '');
  if (!courseId) {
    return { status: 'error', message: t.generic };
  }

  const course = await prisma.course.findFirst({
    where: { id: courseId, published: true },
    select: { id: true },
  });
  if (!course) {
    return { status: 'error', message: t.courseUnavailable };
  }

  await prisma.enrollment.upsert({
    where: { userId_courseId: { userId, courseId } },
    update: {},
    create: { userId, courseId, status: 'PENDING' },
  });

  await audit({
    action: 'enrollment.create',
    entity: 'enrollment',
    entityId: courseId,
    metadata: { courseId, userId },
  });

  redirect(`/${locale}/aluno`);
  return { status: 'ok' };
}
