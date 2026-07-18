import {
  type CallHandler,
  type ExecutionContext,
  Injectable,
  type NestInterceptor,
} from '@nestjs/common';
import { AppError, ErrorCode } from '@invincible/utils';
import type { Request } from 'express';
import { type Observable, from, of, switchMap } from 'rxjs';
import { tap } from 'rxjs/operators';

import { RedisService } from '../../redis/redis.service';

const IDEMPOTENCY_HEADER = 'idempotency-key';
const MUTATING = new Set(['POST', 'PUT', 'PATCH']);
const TTL_SECONDS = 60 * 60 * 24; // 24h

/**
 * Makes mutating requests safe to retry. When a client sends an
 * `Idempotency-Key` header, the first successful response is cached in Redis
 * and replayed for subsequent identical requests; concurrent duplicates are
 * rejected with 409 while the first is in flight.
 */
@Injectable()
export class IdempotencyInterceptor implements NestInterceptor {
  constructor(private readonly redis: RedisService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest<Request>();
    const key = request.headers[IDEMPOTENCY_HEADER];

    if (!MUTATING.has(request.method) || typeof key !== 'string' || key.length === 0) {
      return next.handle();
    }

    const cacheKey = `idem:${request.method}:${request.originalUrl}:${key}`;

    return from(this.redis.client.get(cacheKey)).pipe(
      switchMap((cached) => {
        if (cached === '__processing__') {
          throw new AppError(ErrorCode.Conflict, 'A request with this Idempotency-Key is already being processed.');
        }
        if (cached) {
          return of(JSON.parse(cached) as unknown);
        }
        // Reserve the key, then run and cache the result.
        return from(this.redis.client.set(cacheKey, '__processing__', 'EX', 60, 'NX')).pipe(
          switchMap(() =>
            next.handle().pipe(
              tap((response) => {
                void this.redis.client.set(cacheKey, JSON.stringify(response), 'EX', TTL_SECONDS);
              }),
            ),
          ),
        );
      }),
    );
  }
}
