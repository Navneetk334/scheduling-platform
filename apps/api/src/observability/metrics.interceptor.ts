import {
  type CallHandler,
  type ExecutionContext,
  Injectable,
  type NestInterceptor,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { type Observable, tap } from 'rxjs';

import { MetricsService } from './metrics.service';

/** Records latency + counts for every HTTP request into Prometheus. */
@Injectable()
export class MetricsInterceptor implements NestInterceptor {
  constructor(private readonly metrics: MetricsService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    if (context.getType() !== 'http') return next.handle();

    const start = process.hrtime.bigint();
    const request = context.switchToHttp().getRequest<Request>();
    const response = context.switchToHttp().getResponse<Response>();
    const route = `${request.baseUrl}${request.route?.path ?? request.path}`;

    return next.handle().pipe(
      tap({
        next: () => this.record(request.method, route, response.statusCode, start),
        error: () => this.record(request.method, route, response.statusCode || 500, start),
      }),
    );
  }

  private record(method: string, route: string, status: number, start: bigint): void {
    const seconds = Number(process.hrtime.bigint() - start) / 1e9;
    this.metrics.observe(method, route, status, seconds);
  }
}
