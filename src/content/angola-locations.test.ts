import { describe, expect, it } from 'vitest';

import { PROVINCES, municipalitiesFor } from './angola-locations';

describe('PROVINCES', () => {
  it('contém as 19 províncias de Angola', () => {
    expect(PROVINCES).toHaveLength(19);
  });

  it('tem código e nome em todas as províncias', () => {
    for (const province of PROVINCES) {
      expect(province.code).toMatch(/^[A-Z]{3}$/);
      expect(province.name.length).toBeGreaterThan(0);
    }
  });

  it('inclui Luanda e Bengo com os códigos da AngoAPI', () => {
    expect(PROVINCES).toContainEqual({ code: 'LUA', name: 'Luanda' });
    expect(PROVINCES).toContainEqual({ code: 'BGO', name: 'Bengo' });
  });
});

describe('municipalitiesFor', () => {
  it('devolve os municípios de Luanda', () => {
    const municipalities = municipalitiesFor('LUA');

    expect(municipalities).toHaveLength(9);
    expect(municipalities).toContainEqual({ code: 'CAC', name: 'Cacuaco' });
  });

  it('devolve os municípios de Bengo e Benguela', () => {
    expect(municipalitiesFor('BGO')).toHaveLength(4);
    expect(municipalitiesFor('BGU')).toHaveLength(4);
  });

  it('devolve lista vazia para províncias sem lista de municípios', () => {
    expect(municipalitiesFor('BIE')).toEqual([]);
    expect(municipalitiesFor('NAO-EXISTE')).toEqual([]);
  });

  it('aceita o código em minúsculas', () => {
    expect(municipalitiesFor('lua')).toHaveLength(9);
  });
});
