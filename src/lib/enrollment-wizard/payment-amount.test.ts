import { describe, expect, it } from 'vitest';

import { valorParaInput } from './payment-amount';

describe('valorParaInput', () => {
  it('normaliza um preço em kwanzas para o input numérico', () => {
    expect(valorParaInput('50.000,00 Kz')).toBe('50000');
  });

  it('normaliza um valor já numérico', () => {
    expect(valorParaInput('50000')).toBe('50000');
  });

  it('normaliza um valor com centavos', () => {
    expect(valorParaInput('75000.50')).toBe('75000.5');
  });

  it('normaliza um valor formatado em pt-PT', () => {
    expect(valorParaInput('50 000,00')).toBe('50000');
  });

  it('devolve uma string vazia quando não há valor legível', () => {
    expect(valorParaInput('Preço por definir')).toBe('');
    expect(valorParaInput('')).toBe('');
    expect(valorParaInput(null)).toBe('');
    expect(valorParaInput(undefined)).toBe('');
  });
});
