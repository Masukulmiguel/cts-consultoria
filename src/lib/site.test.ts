import { describe, expect, it } from 'vitest';
import { coursePath } from './site';

describe('coursePath', () => {
  it('monta o caminho do curso em português', () => {
    expect(coursePath('pt', 'cts-academia-junior-1')).toBe('/pt/formacao/cts-academia-junior-1');
  });

  it('monta o caminho do curso em inglês', () => {
    expect(coursePath('en', 'cts-academia-junior-1')).toBe('/en/training/cts-academia-junior-1');
  });
});
