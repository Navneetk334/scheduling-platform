import { describe, expect, it } from 'vitest';

import { AppError, ErrorCode, isAppError } from './errors';

describe('AppError', () => {
  it('maps codes to HTTP status codes', () => {
    expect(new AppError(ErrorCode.Validation, 'x').statusCode).toBe(422);
    expect(new AppError(ErrorCode.Unauthorized, 'x').statusCode).toBe(401);
    expect(new AppError(ErrorCode.NotFound, 'x').statusCode).toBe(404);
    expect(new AppError(ErrorCode.RateLimited, 'x').statusCode).toBe(429);
    expect(new AppError(ErrorCode.Internal, 'x').statusCode).toBe(500);
  });

  it('serializes to a stable shape', () => {
    const err = new AppError(ErrorCode.Conflict, 'boom', { details: { field: 'slug' } });
    expect(err.toJSON()).toEqual({
      code: 'CONFLICT',
      message: 'boom',
      statusCode: 409,
      details: { field: 'slug' },
    });
  });

  it('omits details when absent', () => {
    expect(new AppError(ErrorCode.NotFound, 'nope').toJSON()).toEqual({
      code: 'NOT_FOUND',
      message: 'nope',
      statusCode: 404,
    });
  });

  it('provides ergonomic factories', () => {
    expect(AppError.notFound('Organization', 'org_1').message).toContain('Organization');
    expect(AppError.conflict('dup').code).toBe('CONFLICT');
    expect(AppError.slotUnavailable().code).toBe('SLOT_UNAVAILABLE');
  });

  it('is detectable via guard and instanceof', () => {
    const err = new AppError(ErrorCode.Internal, 'x');
    expect(isAppError(err)).toBe(true);
    expect(isAppError(new Error('plain'))).toBe(false);
    expect(err).toBeInstanceOf(Error);
  });
});
