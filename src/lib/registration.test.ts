import { describe, expect, it } from 'vitest';
import { normalizeEmail, passwordProblem, registrationSchema } from './registration';

describe('regras de registo', () => {
  it('normaliza o email', () => {
    expect(normalizeEmail('  Maria@CTS.Angola ')).toBe('maria@cts.angola');
  });

  it('rejeita email inválido', () => {
    expect(
      registrationSchema.safeParse({ email: 'nao-e-email', name: 'Maria', password: 'segredo123' })
        .success,
    ).toBe(false);
  });

  it('rejeita nome vazio ou demasiado curto', () => {
    expect(
      registrationSchema.safeParse({ email: 'maria@cts.angola', name: 'M', password: 'segredo123' })
        .success,
    ).toBe(false);
  });

  it('rejeita palavra-passe com menos de 8 caracteres', () => {
    expect(
      registrationSchema.safeParse({ email: 'maria@cts.angola', name: 'Maria', password: 'curta1' })
        .success,
    ).toBe(false);
    expect(passwordProblem('curta1')).toContain('8 caracteres');
  });

  it('aceita uma palavra-passe válida', () => {
    expect(
      registrationSchema.safeParse({
        email: 'maria@cts.angola',
        name: 'Maria Silva',
        password: 'segredo123',
      }).success,
    ).toBe(true);
    expect(passwordProblem('segredo123')).toBeNull();
  });
});
