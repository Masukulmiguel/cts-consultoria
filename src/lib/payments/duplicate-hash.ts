import { createHash } from 'node:crypto';

/**
 * Assinatura de anti-duplicação de um comprovativo: mesma referência, mesmo
 * valor e mesma data dão a mesma assinatura. A referência é normalizada
 * (espaços e maiúsculas) e o valor arredondado a duas casas.
 */
export function paymentDuplicateHash(input: {
  reference: string | null;
  amount: number;
  paymentDate: string;
}): string {
  const reference = (input.reference ?? '').trim().toLowerCase();
  const amount = input.amount.toFixed(2);
  const paymentDate = input.paymentDate.trim();

  return createHash('sha256').update(`${reference}|${amount}|${paymentDate}`).digest('hex');
}
