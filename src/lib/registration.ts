import { z } from 'zod';

export const PASSWORD_MIN_LENGTH = 8;
export const PASSWORD_MAX_LENGTH = 128;

/** Regras de criação de conta de formando (validação pura, sem acesso à base de dados). */
export const registrationSchema = z.object({
  email: z.string().trim().email().max(190),
  name: z.string().trim().min(2).max(80),
  password: z.string().min(PASSWORD_MIN_LENGTH).max(PASSWORD_MAX_LENGTH),
});

export type RegistrationInput = z.infer<typeof registrationSchema>;

/** Estado devolvido pelas acções de registo e inscrição. */
export type RegistrationState =
  | { status: 'ok' }
  | { status: 'error'; message: string; field?: 'email' | 'name' | 'password' }
  | null;

/** Normaliza o email para a forma guardada na base de dados. */
export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

/** Devolve null quando a palavra-passe é aceitável; caso contrário a razão da recusa. */
export function passwordProblem(password: string): string | null {
  if (password.length < PASSWORD_MIN_LENGTH) {
    return `A palavra-passe precisa de pelo menos ${PASSWORD_MIN_LENGTH} caracteres.`;
  }
  if (password.length > PASSWORD_MAX_LENGTH) {
    return `A palavra-passe não pode passar de ${PASSWORD_MAX_LENGTH} caracteres.`;
  }
  return null;
}
