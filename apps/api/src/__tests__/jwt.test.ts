import { describe, it, expect } from 'vitest';
import './_setup';
import { signAccessToken, verifyAccessToken } from '../utils/jwt';

describe('utils/jwt', () => {
  const payload = {
    sub: '507f1f77bcf86cd799439011',
    email: 'test@example.com',
    role: 'user' as const,
    status: 'approved' as const,
  };

  it('round-trips a token', () => {
    const token = signAccessToken(payload);
    expect(typeof token).toBe('string');
    expect(token.split('.')).toHaveLength(3);
    const decoded = verifyAccessToken(token);
    expect(decoded.sub).toBe(payload.sub);
    expect(decoded.email).toBe(payload.email);
    expect(decoded.role).toBe('user');
    expect(decoded.status).toBe('approved');
  });

  it('rejects garbage tokens', () => {
    expect(() => verifyAccessToken('not-a-jwt')).toThrow();
    expect(() => verifyAccessToken('a.b.c')).toThrow();
    expect(() => verifyAccessToken('')).toThrow();
  });

  it('rejects tampered tokens', () => {
    const token = signAccessToken(payload);
    const parts = token.split('.');
    const tampered = `${parts[0]}.${parts[1]}.WRONGSIGNATURE`;
    expect(() => verifyAccessToken(tampered)).toThrow();
  });
});
