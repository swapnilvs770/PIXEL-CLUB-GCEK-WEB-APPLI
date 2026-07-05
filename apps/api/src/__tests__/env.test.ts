import { describe, it, expect } from 'vitest';
import './_setup';
import { env, isProd, isDev, parseAdminEmails } from '../config/env';

describe('config/env', () => {
  it('loads with stubbed env vars', () => {
    expect(env.NODE_ENV).toBe('test');
    expect(env.MONGO_URI).toContain('mongodb://localhost');
    expect(env.GOOGLE_CLIENT_ID).toBe('test-client-id');
    expect(env.JWT_SECRET.length).toBeGreaterThanOrEqual(16);
    expect(env.PORT).toBe(5000);
  });

  it('isProd / isDev reflect NODE_ENV', () => {
    expect(isProd).toBe(false);
    expect(isDev).toBe(false); // NODE_ENV=test
  });
});

describe('parseAdminEmails', () => {
  it('returns [] for null/undefined/empty', () => {
    expect(parseAdminEmails(null)).toEqual([]);
    expect(parseAdminEmails(undefined)).toEqual([]);
    expect(parseAdminEmails('')).toEqual([]);
  });

  it('trims, lowercases, and drops empties', () => {
    expect(parseAdminEmails('  Foo@Example.com , bar@example.com  ,  ')).toEqual([
      'foo@example.com',
      'bar@example.com',
    ]);
  });

  it('passes a single email through', () => {
    expect(parseAdminEmails('admin@pixelclub.in')).toEqual(['admin@pixelclub.in']);
  });
});
