import { prisma } from '@/lib/prisma';

export type PaymentSettings = {
  bank: string | null;
  express: string | null;
  instructions: string | null;
};

export const SETTING_KEYS = {
  bank: 'payment.bank',
  express: 'payment.express',
  instructions: 'payment.instructions',
} as const;

function readText(value: unknown): string | null {
  if (typeof value === 'string') return value.trim() || null;
  if (value && typeof value === 'object' && 'value' in value) {
    const inner = (value as { value?: unknown }).value;
    if (typeof inner === 'string') return inner.trim() || null;
  }
  return null;
}

/**
 * Dados de pagamento configurados pelo admin. Nunca inventa IBAN, valor ou
 * referência: o que não estiver configurado é `null`.
 */
export async function getPaymentSettings(): Promise<PaymentSettings> {
  const settings = await prisma.setting.findMany({
    where: {
      key: {
        in: [SETTING_KEYS.bank, SETTING_KEYS.express, SETTING_KEYS.instructions],
      },
    },
  });

  const values = new Map(settings.map((setting) => [setting.key, readText(setting.value)]));

  return {
    bank: values.get(SETTING_KEYS.bank) ?? null,
    express: values.get(SETTING_KEYS.express) ?? null,
    instructions: values.get(SETTING_KEYS.instructions) ?? null,
  };
}
