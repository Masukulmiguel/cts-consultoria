import { parseAmountKz } from '@/lib/ocr/extract-amount';

/**
 * Normaliza um valor em texto livre para a string numérica de um
 * `input type="number"` (ex.: '50.000,00 Kz' → '50000').
 * Devolve uma string vazia quando não há valor legível.
 */
export function valorParaInput(valor: string | null | undefined): string {
  if (!valor) return '';
  const analisado = parseAmountKz(valor);
  if (analisado === null || !Number.isFinite(analisado)) return '';
  return String(analisado);
}
