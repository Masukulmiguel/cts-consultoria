import { describe, expect, it } from 'vitest';

import { paymentDuplicateHash } from './duplicate-hash';

const base = { reference: 'TRX-123456', amount: 75000, paymentDate: '2026-12-01' };

describe('paymentDuplicateHash', () => {
  it('devolve o mesmo hash para a mesma referência, valor e data', () => {
    expect(paymentDuplicateHash(base)).toBe(paymentDuplicateHash({ ...base }));
  });

  it('devolve hashes diferentes para referências diferentes', () => {
    const primeiro = paymentDuplicateHash(base);
    const segundo = paymentDuplicateHash({ ...base, reference: 'TRX-654321' });

    expect(primeiro).not.toBe(segundo);
  });

  it('normaliza o valor para duas casas decimais', () => {
    expect(paymentDuplicateHash({ ...base, amount: 75000 })).toBe(
      paymentDuplicateHash({ ...base, amount: 75000.0 }),
    );
    expect(paymentDuplicateHash({ ...base, amount: 75000.001 })).toBe(
      paymentDuplicateHash({ ...base, amount: 75000.004 }),
    );
    expect(paymentDuplicateHash({ ...base, amount: 75000.001 })).not.toBe(
      paymentDuplicateHash({ ...base, amount: 75000.01 }),
    );
  });

  it('trata uma referência nula como string vazia', () => {
    expect(paymentDuplicateHash({ ...base, reference: null })).toBe(
      paymentDuplicateHash({ ...base, reference: '' }),
    );
  });

  it('ignora espaços e maiúsculas na referência', () => {
    expect(paymentDuplicateHash({ ...base, reference: 'trx-123456' })).toBe(
      paymentDuplicateHash({ ...base, reference: '  TRX-123456  ' }),
    );
  });

  it('devolve um hash hexadecimal de 64 caracteres', () => {
    expect(paymentDuplicateHash(base)).toMatch(/^[a-f0-9]{64}$/);
  });
});
