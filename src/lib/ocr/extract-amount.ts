/**
 * Lê um valor em kwanzas a partir de texto livre ('75.000,00 Kz', 'Kz 75.000',
 * '1.234.567,89'). Devolve null quando não há número legível.
 */
export function parseAmountKz(value: string): number | null {
  const cleaned = value.replace(/[^\d.,]/g, '').trim();
  if (!cleaned) return null;

  const lastComma = cleaned.lastIndexOf(',');
  const lastDot = cleaned.lastIndexOf('.');
  let normalized: string;

  if (lastComma > -1 && lastDot > -1) {
    const decimalSeparator = lastComma > lastDot ? ',' : '.';
    const thousandsSeparator = decimalSeparator === ',' ? '.' : ',';
    normalized = cleaned.split(thousandsSeparator).join('').replace(decimalSeparator, '.');
  } else if (lastComma > -1) {
    normalized = cleaned.replace(',', '.');
  } else if (lastDot > -1) {
    const parts = cleaned.split('.');
    const decimals = parts[parts.length - 1];
    normalized = parts.length > 2 || decimals.length === 3 ? parts.join('') : cleaned;
  } else {
    normalized = cleaned;
  }

  const parsed = Number.parseFloat(normalized);
  if (!Number.isFinite(parsed)) return null;
  return parsed;
}
