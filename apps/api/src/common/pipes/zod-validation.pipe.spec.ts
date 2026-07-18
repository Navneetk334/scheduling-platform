import { AppError } from '@invincible/utils';
import { describe, expect, it } from 'vitest';
import { z } from 'zod';

import { ZodValidationPipe } from './zod-validation.pipe';

const schema = z.object({
  name: z.string().min(2),
  age: z.number().int().min(0),
});

describe('ZodValidationPipe', () => {
  it('returns parsed data for valid input', () => {
    const pipe = new ZodValidationPipe(schema);
    expect(pipe.transform({ name: 'Ada', age: 30 })).toEqual({ name: 'Ada', age: 30 });
  });

  it('throws a VALIDATION_ERROR AppError with field details on invalid input', () => {
    const pipe = new ZodValidationPipe(schema);
    try {
      pipe.transform({ name: 'A', age: -1 });
      throw new Error('should have thrown');
    } catch (error) {
      expect(error).toBeInstanceOf(AppError);
      const appError = error as AppError;
      expect(appError.code).toBe('VALIDATION_ERROR');
      expect(appError.statusCode).toBe(422);
      const fields = (appError.details as { fields: Record<string, string[]> }).fields;
      expect(Object.keys(fields)).toContain('name');
      expect(Object.keys(fields)).toContain('age');
    }
  });
});
