import { createHmac, randomBytes } from 'node:crypto';

/**
 * TOTP RFC 6238 (SHA-1, 30 s, 6 dígitos) — implementação própria, sem dependências.
 */

const BASE32_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';

export function base32Encode(buffer: Buffer): string {
  let bits = 0;
  let value = 0;
  let output = '';
  for (const byte of buffer) {
    value = (value << 8) | byte;
    bits += 8;
    while (bits >= 5) {
      output += BASE32_ALPHABET[(value >>> (bits - 5)) & 31];
      bits -= 5;
    }
  }
  if (bits > 0) output += BASE32_ALPHABET[(value << (5 - bits)) & 31];
  return output;
}

export function base32Decode(input: string): Buffer {
  const clean = input.toUpperCase().replace(/=+$/, '').replace(/\s/g, '');
  let bits = 0;
  let value = 0;
  const out: number[] = [];
  for (const char of clean) {
    const idx = BASE32_ALPHABET.indexOf(char);
    if (idx === -1) throw new Error('Base32 inválido');
    value = (value << 5) | idx;
    bits += 5;
    if (bits >= 8) {
      out.push((value >>> (bits - 8)) & 255);
      bits -= 8;
    }
  }
  return Buffer.from(out);
}

export function generateTotpSecret(): string {
  return base32Encode(randomBytes(20));
}

export function totpCode(
  secretBase32: string,
  atMs: number = Date.now(),
  stepSec = 30,
  digits = 6,
): string {
  const counter = Math.floor(atMs / 1000 / stepSec);
  const buf = Buffer.alloc(8);
  buf.writeBigUInt64BE(BigInt(counter));
  const hmac = createHmac('sha1', base32Decode(secretBase32)).update(buf).digest();
  const offset = hmac[hmac.length - 1] & 0x0f;
  const code =
    (((hmac[offset] & 0x7f) << 24) |
      (hmac[offset + 1] << 16) |
      (hmac[offset + 2] << 8) |
      hmac[offset + 3]) %
    10 ** digits;
  return code.toString().padStart(digits, '0');
}

/** Verifica um código TOTP aceitando ±1 janela de tempo (desvio de relógio). */
export function verifyTotp(secretBase32: string, token: string, window = 1): boolean {
  const clean = token.replace(/\D/g, '');
  if (clean.length !== 6) return false;
  const now = Date.now();
  for (let w = -window; w <= window; w++) {
    if (totpCode(secretBase32, now + w * 30_000) === clean) return true;
  }
  return false;
}
