import { describe, it, expect } from 'vitest';
import './_setup';
import { AppError } from '../utils/AppError';

describe('utils/AppError', () => {
  it('captures message, status, code, and details', () => {
    const err = new AppError({
      message: 'Boom',
      statusCode: 422,
      code: 'INVALID_INPUT',
      details: { field: 'email' },
    });
    expect(err).toBeInstanceOf(Error);
    expect(err).toBeInstanceOf(AppError);
    expect(err.message).toBe('Boom');
    expect(err.statusCode).toBe(422);
    expect(err.code).toBe('INVALID_INPUT');
    expect(err.details).toEqual({ field: 'email' });
    expect(err.isOperational).toBe(true);
  });

  it('defaults to 500 / INTERNAL_ERROR', () => {
    const err = new AppError({ message: 'oops' });
    expect(err.statusCode).toBe(500);
    expect(err.code).toBe('INTERNAL_ERROR');
  });
});
