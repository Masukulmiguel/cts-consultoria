import { describe, expect, it } from 'vitest';

import { compareIdentity, normalizeDate, normalizeText } from './compare';

const registado = {
  fullName: 'Maria José Silva',
  biNumber: '004512345LA041',
  birthDate: '1990-01-13',
};

describe('normalizeText', () => {
  it('colapsa espaços repetidos', () => {
    expect(normalizeText('Maria  Silva')).toBe('maria silva');
  });

  it('remove acentos e passa a minúsculas', () => {
    expect(normalizeText('José António')).toBe('jose antonio');
  });

  it('ignora espaços nas extremidades', () => {
    expect(normalizeText('  Maria Silva  ')).toBe('maria silva');
  });
});

describe('normalizeDate', () => {
  it('converte dd/mm/aaaa em aaaa-mm-dd', () => {
    expect(normalizeDate('13/01/1990')).toBe('1990-01-13');
  });

  it('normaliza aaaa-m-d para aaaa-mm-dd', () => {
    expect(normalizeDate('1990-1-3')).toBe('1990-01-03');
  });

  it('mantém uma data já em ISO', () => {
    expect(normalizeDate('1990-01-13')).toBe('1990-01-13');
  });

  it('devolve null para texto inválido', () => {
    expect(normalizeDate('abc')).toBeNull();
  });

  it('devolve null para uma data impossível', () => {
    expect(normalizeDate('31/02/1990')).toBeNull();
  });
});

describe('compareIdentity', () => {
  it('compara os três campos registados', () => {
    const resultado = compareIdentity(registado, {
      fullName: 'Maria José Silva',
      biNumber: '004512345LA041',
      birthDate: '13/01/1990',
    });

    expect(resultado).toHaveLength(3);
    expect(resultado.map((campo) => campo.field)).toEqual(['fullName', 'biNumber', 'birthDate']);
  });

  it('dá MATCH quando o nome é igual com acentos diferentes', () => {
    const resultado = compareIdentity(registado, { fullName: 'Maria Jose Silva' });
    const nome = resultado.find((campo) => campo.field === 'fullName');

    expect(nome?.outcome).toBe('MATCH');
  });

  it('dá DIFFERENT quando o nome é diferente', () => {
    const resultado = compareIdentity(registado, { fullName: 'Ana Costa' });
    const nome = resultado.find((campo) => campo.field === 'fullName');

    expect(nome?.outcome).toBe('DIFFERENT');
  });

  it('dá UNKNOWN quando o campo não foi extraído', () => {
    const resultado = compareIdentity(registado, {});
    const nome = resultado.find((campo) => campo.field === 'fullName');

    expect(nome?.outcome).toBe('UNKNOWN');
    expect(nome?.extracted).toBeNull();
  });

  it('dá MATCH quando o BI só difere na pontuação', () => {
    const resultado = compareIdentity(registado, { biNumber: '004512345 LA 041' });
    const bi = resultado.find((campo) => campo.field === 'biNumber');

    expect(bi?.outcome).toBe('MATCH');
  });

  it('dá UNKNOWN quando a data tem um formato inesperado', () => {
    const resultado = compareIdentity(registado, { birthDate: 'sem data' });
    const data = resultado.find((campo) => campo.field === 'birthDate');

    expect(data?.outcome).toBe('UNKNOWN');
  });

  it('dá MATCH quando a data extraída é equivalente', () => {
    const resultado = compareIdentity(registado, { birthDate: '13/01/1990' });
    const data = resultado.find((campo) => campo.field === 'birthDate');

    expect(data?.outcome).toBe('MATCH');
  });

  it('dá DIFFERENT quando a data é diferente', () => {
    const resultado = compareIdentity(registado, { birthDate: '14/01/1990' });
    const data = resultado.find((campo) => campo.field === 'birthDate');

    expect(data?.outcome).toBe('DIFFERENT');
  });

  it('mantém o valor registado e o valor extraído no resultado', () => {
    const resultado = compareIdentity(registado, { fullName: 'Ana Costa' });
    const nome = resultado.find((campo) => campo.field === 'fullName');

    expect(nome?.registered).toBe('Maria José Silva');
    expect(nome?.extracted).toBe('Ana Costa');
  });
});
