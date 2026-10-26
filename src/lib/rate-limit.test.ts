import { describe, expect, it } from 'vitest';
import { rateLimit, resetRateLimits } from './rate-limit';

describe('rate limiter', () => {
  it('permite até ao limite e bloqueia a seguir', () => {
    resetRateLimits();
    const key = `test-${Date.now()}`;
    for (let i = 0; i < 3; i++) {
      expect(rateLimit(key, 3, 60_000).ok).toBe(true);
    }
    expect(rateLimit(key, 3, 60_000).ok).toBe(false);
  });

  it('chaves diferentes não interferem', () => {
    resetRateLimits();
    expect(rateLimit('a', 1, 60_000).ok).toBe(true);
    expect(rateLimit('b', 1, 60_000).ok).toBe(true);
    expect(rateLimit('a', 1, 60_000).ok).toBe(false);
  });
});
