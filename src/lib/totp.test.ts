import { describe, expect, it } from 'vitest';
import { base32Decode, base32Encode, generateTotpSecret, totpCode, verifyTotp } from './totp';

describe('TOTP (RFC 6238)', () => {
  // Vector oficial RFC 6238 (SHA-1, secret "12345678901234567890" = Base32 GEZDGNBVGY3TQOJQGEZDGNBVGY3TQOJQ)
  const RFC_SECRET = 'GEZDGNBVGY3TQOJQGEZDGNBVGY3TQOJQ';

  it('gera código correcto para o vector RFC 6238 (t=59s → 94287082)', () => {
    expect(totpCode(RFC_SECRET, 59_000)).toBe('94287082'.slice(-6)); // 287082
  });

  it('verifica o próprio código gerado', () => {
    const secret = generateTotpSecret();
    const code = totpCode(secret);
    expect(verifyTotp(secret, code)).toBe(true);
  });

  it('rejeita código errado', () => {
    const secret = generateTotpSecret();
    expect(verifyTotp(secret, '000000')).toBe(false);
  });

  it('rejeita códigos com tamanho inválido', () => {
    const secret = generateTotpSecret();
    expect(verifyTotp(secret, '123')).toBe(false);
    expect(verifyTotp(secret, 'abcdef')).toBe(false);
  });

  it('base32 encode/decode é reversível', () => {
    const buf = Buffer.from('CTS Consultoria 2026');
    expect(base32Decode(base32Encode(buf)).toString('utf8')).toBe('CTS Consultoria 2026');
  });
});
