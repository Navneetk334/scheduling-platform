import { AppError, ErrorCode } from '@invincible/utils';
import { type PipeTransform } from '@nestjs/common';
import type { ZodSchema } from 'zod';

/**
 * Validates and parses incoming payloads against a Zod schema. On failure it
 * throws an {@link AppError} (VALIDATION_ERROR) carrying field-level details,
 * which the global filter serializes into a stable response shape.
 */
export class ZodValidationPipe<T> implements PipeTransform<unknown, T> {
  constructor(private readonly schema: ZodSchema<T>) {}

  transform(value: unknown): T {
    const result = this.schema.safeParse(value);
    if (!result.success) {
      const fieldErrors: Record<string, string[]> = {};
      for (const issue of result.error.issues) {
        const path = issue.path.join('.') || '_root';
        (fieldErrors[path] ??= []).push(issue.message);
      }
      throw new AppError(ErrorCode.Validation, 'Request validation failed.', {
        details: { fields: fieldErrors },
      });
    }
    return result.data;
  }
}
