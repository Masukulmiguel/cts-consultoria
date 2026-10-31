import { type Locale, answerMessage } from '@/content/chatbot';
import { rateLimit } from '@/lib/rate-limit';
import { type NextRequest, NextResponse } from 'next/server';

const MAX_MESSAGE = 500;

export async function POST(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'local';
  const limit = rateLimit(`chat:${ip}`, 30, 60_000);
  if (!limit.ok) {
    return NextResponse.json({ error: 'too_many_requests' }, { status: 429 });
  }

  const body = (await request.json().catch(() => null)) as {
    message?: unknown;
    locale?: unknown;
  } | null;

  const message = typeof body?.message === 'string' ? body.message.slice(0, MAX_MESSAGE) : '';
  const locale: Locale = body?.locale === 'en' ? 'en' : 'pt';

  if (!message.trim()) {
    return NextResponse.json({ error: 'empty_message' }, { status: 400 });
  }

  const reply = answerMessage(message, locale);
  return NextResponse.json(reply);
}
