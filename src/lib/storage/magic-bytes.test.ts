import { describe, expect, it } from 'vitest';

import { sniffMimeType } from './magic-bytes';

const jpeg = new Uint8Array([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10]);
const png = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
const pdf = new Uint8Array([0x25, 0x50, 0x44, 0x46, 0x2d, 0x31, 0x2e, 0x37]);
const zip = new Uint8Array([0x50, 0x4b, 0x03, 0x04]);
const aleatorio = new Uint8Array([0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07, 0x08]);

describe('sniffMimeType', () => {
  it('detecta JPEG', () => {
    expect(sniffMimeType(jpeg)).toBe('image/jpeg');
  });

  it('detecta PNG', () => {
    expect(sniffMimeType(png)).toBe('image/png');
  });

  it('detecta PDF', () => {
    expect(sniffMimeType(pdf)).toBe('application/pdf');
  });

  it('devolve null para um ZIP', () => {
    expect(sniffMimeType(zip)).toBeNull();
  });

  it('devolve null para conteúdo aleatório', () => {
    expect(sniffMimeType(aleatorio)).toBeNull();
  });

  it('devolve null para um ficheiro vazio', () => {
    expect(sniffMimeType(new Uint8Array([]))).toBeNull();
  });

  it('rejeita um ficheiro .jpg cujo conteúdo é um ZIP', () => {
    expect(sniffMimeType(zip)).not.toBe('image/jpeg');
  });

  it('detecta o tipo a partir dos primeiros bytes', () => {
    const comCabecalho = new Uint8Array([...jpeg, ...new Uint8Array(64).fill(0x41)]);

    expect(sniffMimeType(comCabecalho)).toBe('image/jpeg');
  });
});
