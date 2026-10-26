'use server';

import { createHash } from 'node:crypto';
import { prisma } from '@/lib/prisma';
import { rateLimit } from '@/lib/rate-limit';
import { headers } from 'next/headers';
import { z } from 'zod';

type FormState = { status: 'success' } | { status: 'error'; message: string } | null;

const MESSAGES = {
  pt: {
    invalid: 'Por favor, verifique os campos indicados.',
    rateLimit: 'Demasiadas tentativas. Aguarde alguns minutos e tente novamente.',
    honeypot: 'Submissão rejeitada.',
    generic: 'Não foi possível enviar a mensagem. Tente novamente ou contacte-nos por telefone.',
    nameRequired: 'O nome é obrigatório.',
    emailRequired: 'O e-mail é obrigatório.',
    emailInvalid: 'O e-mail indicado não é válido.',
    messageRequired: 'A mensagem é obrigatória.',
  },
  en: {
    invalid: 'Please check the highlighted fields.',
    rateLimit: 'Too many attempts. Please wait a few minutes and try again.',
    honeypot: 'Submission rejected.',
    generic: 'Could not send your message. Please try again or contact us by phone.',
    nameRequired: 'Name is required.',
    emailRequired: 'Email is required.',
    emailInvalid: 'The email address is invalid.',
    messageRequired: 'Message is required.',
  },
} as const;

function detectLocale(value: string | null): 'pt' | 'en' {
  return value === 'en' ? 'en' : 'pt';
}

const contactSchema = z.object({
  name: z.string().trim().min(1).max(120),
  email: z.string().trim().email().max(190),
  phone: z.string().trim().max(40).optional().or(z.literal('')),
  subject: z.string().trim().max(200).optional().or(z.literal('')),
  message: z.string().trim().min(1).max(4000),
  locale: z.enum(['pt', 'en']),
});

/**
 * Submissão do formulário de contactos (público).
 * Validação com zod, rate limit por IP-hash
 * e honeypot anti-spam. Sem e-mail em fase 1 — persistência em ContactMessage (admin revê).
 */
export async function submitContact(_prev: FormState, formData: FormData): Promise<FormState> {
  const locale = detectLocale(formData.get('locale') as string | null);
  const t = MESSAGES[locale];

  // Honeypot: campo oculto preenchido apenas por bots
  if (String(formData.get('website') ?? '').trim() !== '') {
    return { status: 'error', message: t.honeypot };
  }

  const h = await headers();
  const ip = h.get('x-forwarded-for')?.split(',')[0]?.trim() ?? h.get('x-real-ip') ?? 'unknown';
  const ipHash = createHash('sha256')
    .update(`${ip}:${process.env.AUTH_SECRET ?? 'dev'}`)
    .digest('hex');

  const limit = rateLimit(`contact:${ipHash}`, 5, 10 * 60 * 1000); // 5 submissões / 10 min
  if (!limit.ok) return { status: 'error', message: t.rateLimit };

  const parsed = contactSchema.safeParse({
    name: String(formData.get('name') ?? ''),
    email: String(formData.get('email') ?? ''),
    phone: String(formData.get('phone') ?? ''),
    subject: String(formData.get('subject') ?? ''),
    message: String(formData.get('message') ?? ''),
    locale,
  });

  if (!parsed.success) {
    const first = parsed.error.issues[0];
    if (first?.path[0] === 'email') return { status: 'error', message: t.emailInvalid };
    if (first?.path[0] === 'name') return { status: 'error', message: t.nameRequired };
    if (first?.path[0] === 'message') return { status: 'error', message: t.messageRequired };
    return { status: 'error', message: t.invalid };
  }

  const { name, email, phone, subject, message } = parsed.data;

  try {
    await prisma.contactMessage.create({
      data: {
        name: name.slice(0, 120),
        email: email.slice(0, 190),
        phone: phone ? phone.slice(0, 40) : null,
        subject: subject ? subject.slice(0, 200) : null,
        message: message.slice(0, 4000),
        locale,
        ipHash,
        userAgent: h.get('user-agent')?.slice(0, 300),
      },
    });
    return { status: 'success' };
  } catch {
    return { status: 'error', message: t.generic };
  }
}
