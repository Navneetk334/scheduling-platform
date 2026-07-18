import {
  type ArgumentsHost,
  Catch,
  type ExceptionFilter,
  HttpException,
  Logger,
} from '@nestjs/common';
import { AppError, ErrorCode, isAppError } from '@invincible/utils';
import type { AppErrorShape } from '@invincible/types';
import type { Request, Response } from 'express';
import { ZodError } from 'zod';

/**
 * Single choke point translating every thrown error into a stable JSON
 * contract ({@link AppErrorShape}). Never leaks stack traces or internal
 * details to clients in production.
 */
@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const requestId = (request.headers['x-request-id'] as string | undefined) ?? undefined;

    const error = this.normalize(exception);
    const body: AppErrorShape = { ...error, ...(requestId ? { requestId } : {}) };

    if (error.statusCode >= 500) {
      this.logger.error(
        `${request.method} ${request.url} → ${error.statusCode} ${error.code}`,
        exception instanceof Error ? exception.stack : String(exception),
      );
    } else {
      this.logger.warn(`${request.method} ${request.url} → ${error.statusCode} ${error.code}`);
    }

    response.status(error.statusCode).json(body);
  }

  private normalize(exception: unknown): AppErrorShape {
    if (isAppError(exception)) {
      return exception.toJSON();
    }

    if (exception instanceof ZodError) {
      return new AppError(ErrorCode.Validation, 'Request validation failed.', {
        details: { issues: exception.issues },
      }).toJSON();
    }

    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const res = exception.getResponse();
      const message =
        typeof res === 'string'
          ? res
          : ((res as { message?: string | string[] }).message ?? exception.message);
      return {
        code: this.statusToCode(status),
        message: Array.isArray(message) ? message.join(', ') : message,
        statusCode: status,
      };
    }

    return {
      code: ErrorCode.Internal,
      message: 'An unexpected error occurred.',
      statusCode: 500,
    };
  }

  private statusToCode(status: number): string {
    switch (status) {
      case 400:
        return ErrorCode.Validation;
      case 401:
        return ErrorCode.Unauthorized;
      case 403:
        return ErrorCode.Forbidden;
      case 404:
        return ErrorCode.NotFound;
      case 409:
        return ErrorCode.Conflict;
      case 429:
        return ErrorCode.RateLimited;
      default:
        return ErrorCode.Internal;
    }
  }
}
