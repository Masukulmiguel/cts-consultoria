import { describe, expect, it } from 'vitest';

import { step1Schema, step4Schema } from './schemas';

const dados = {
  primaryDocumentType: 'BI',
  nif: '',
  biNumber: '004512345LA041',
  fullName: 'Maria Silva',
  birthDate: '1990-01-13',
  address: 'Rua Amílcar Cabral, 12',
  municipality: 'Luanda',
  province: 'Luanda',
  phone: '+244923000000',
  email: 'maria@cts.angola',
};

const pagamento = {
  method: 'EXPRESS',
  amount: 75000,
  reference: 'TRX-123456',
  paymentDate: '2026-12-01',
};

describe('step1Schema', () => {
  it('aceita biNumber de 14 dígitos', () => {
    const resultado = step1Schema.safeParse(dados);

    expect(resultado.success).toBe(true);
  });

  it('rejeita biNumber de 3 dígitos', () => {
    const resultado = step1Schema.safeParse({ ...dados, biNumber: '123' });

    expect(resultado.success).toBe(false);
    if (!resultado.success) {
      expect(resultado.error.issues[0].path).toContain('biNumber');
    }
  });

  it('aceita o telefone angolano +244923000000', () => {
    expect(step1Schema.safeParse(dados).success).toBe(true);
  });

  it('rejeita o telefone abc', () => {
    const resultado = step1Schema.safeParse({ ...dados, phone: 'abc' });

    expect(resultado.success).toBe(false);
    if (!resultado.success) {
      expect(resultado.error.issues[0].path).toContain('phone');
    }
  });

  it('aceita birthDate em formato ISO', () => {
    expect(step1Schema.safeParse({ ...dados, birthDate: '1990-01-13' }).success).toBe(true);
  });

  it('rejeita birthDate em formato dd/mm/aaaa (formato ISO obrigatório)', () => {
    const resultado = step1Schema.safeParse({ ...dados, birthDate: '13/01/1990' });

    expect(resultado.success).toBe(false);
    if (!resultado.success) {
      expect(resultado.error.issues[0].path).toContain('birthDate');
    }
  });

  it('rejeita uma data ISO que não existe', () => {
    expect(step1Schema.safeParse({ ...dados, birthDate: '1990-02-31' }).success).toBe(false);
  });

  it('exige o NIF quando o tipo de documento é NIF', () => {
    const comNif = step1Schema.safeParse({
      ...dados,
      primaryDocumentType: 'NIF',
      nif: '123456789',
      biNumber: '',
    });
    const semNif = step1Schema.safeParse({
      ...dados,
      primaryDocumentType: 'NIF',
      nif: '',
      biNumber: '',
    });

    expect(comNif.success).toBe(true);
    expect(semNif.success).toBe(false);
  });

  it('rejeita um NIF com formato inválido', () => {
    expect(step1Schema.safeParse({ ...dados, nif: 'abc' }).success).toBe(false);
  });

  it('rejeita um e-mail inválido', () => {
    expect(step1Schema.safeParse({ ...dados, email: 'maria@' }).success).toBe(false);
  });

  it('rejeita um nome completo demasiado curto', () => {
    expect(step1Schema.safeParse({ ...dados, fullName: 'M' }).success).toBe(false);
  });

  it('devolve mensagens de erro em português', () => {
    const resultado = step1Schema.safeParse({ ...dados, phone: 'abc' });

    expect(resultado.success).toBe(false);
    if (!resultado.success) {
      expect(resultado.error.issues[0].message).toMatch(/[A-Za-zÀ-ÿ]/);
      expect(resultado.error.issues[0].message).not.toMatch(/Invalid|Required|Expected/);
    }
  });
});

describe('step4Schema', () => {
  it('aceita o método Express com valor positivo', () => {
    expect(step4Schema.safeParse(pagamento).success).toBe(true);
  });

  it('rejeita amount negativo', () => {
    const resultado = step4Schema.safeParse({ ...pagamento, amount: -1 });

    expect(resultado.success).toBe(false);
    if (!resultado.success) {
      expect(resultado.error.issues[0].path).toContain('amount');
    }
  });

  it('rejeita amount zero', () => {
    expect(step4Schema.safeParse({ ...pagamento, amount: 0 }).success).toBe(false);
  });

  it('rejeita method PIX', () => {
    const resultado = step4Schema.safeParse({ ...pagamento, method: 'PIX' });

    expect(resultado.success).toBe(false);
    if (!resultado.success) {
      expect(resultado.error.issues[0].path).toContain('method');
    }
  });

  it('aceita transferênca bancária sem referência', () => {
    expect(
      step4Schema.safeParse({ ...pagamento, method: 'BANK_TRANSFER', reference: undefined })
        .success,
    ).toBe(true);
  });

  it('rejeita uma referência com mais de 120 caracteres', () => {
    expect(step4Schema.safeParse({ ...pagamento, reference: 'x'.repeat(121) }).success).toBe(false);
  });

  it('aceita os valores extraídos por OCR como opcionais', () => {
    expect(
      step4Schema.safeParse({
        ...pagamento,
        ocrValue: '75.000,00 Kz',
        ocrReference: 'TRX-999',
      }).success,
    ).toBe(true);
  });

  it('rejeita uma data de pagamento vazia ou fora do formato ISO', () => {
    expect(step4Schema.safeParse({ ...pagamento, paymentDate: '' }).success).toBe(false);
    expect(step4Schema.safeParse({ ...pagamento, paymentDate: '01/12/2026' }).success).toBe(false);
  });
});
