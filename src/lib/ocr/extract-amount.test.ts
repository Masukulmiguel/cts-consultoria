import { describe, expect, it } from 'vitest';

import { parseAmountKz } from './extract-amount';

describe('parseAmountKz', () => {
  it('lê 75.000,00 Kz', () => {
    expect(parseAmountKz('75.000,00 Kz')).toBe(75000);
  });

  it('lê 75000 Kz', () => {
    expect(parseAmountKz('75000 Kz')).toBe(75000);
  });

  it('lê Kz 75.000', () => {
    expect(parseAmountKz('Kz 75.000')).toBe(75000);
  });

  it('lê 1.234.567,89', () => {
    expect(parseAmountKz('1.234.567,89')).toBe(1234567.89);
  });

  it('devolve null para texto sem número', () => {
    expect(parseAmountKz('abc')).toBeNull();
  });

  it('devolve null para texto vazio', () => {
    expect(parseAmountKz('')).toBeNull();
  });

  it('lê um valor com centavos', () => {
    expect(parseAmountKz('1.500,50 Kz')).toBe(1500.5);
  });
});
