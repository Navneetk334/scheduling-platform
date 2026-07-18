import {
  type CanActivate,
  type ExecutionContext,
  Injectable,
  SetMetadata,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AppError, ErrorCode } from '@invincible/utils';
import type { Request, Response } from 'express';

import { AppConfigService } from '../../config/app-config.service';
import { RedisService } from '../../redis/redis.service';

export interface RateLimitOptions {
  max: number;
  windowSec: number;
}

export const RATE_LIMIT_KEY = 'rate-limit-options';
/** Override the default rate limit for a route/controller. */
export const RateLimit = (max: number, windowSec: number) =>
  SetMetadata(RATE_LIMIT_KEY, { max, windowSec } satisfies RateLimitOptions);

export const SKIP_RATE_LIMIT_KEY = 'skip-rate-limit';
export const SkipRateLimit = () => SetMetadata(SKIP_RATE_LIMIT_KEY, true);

/**
 * Distributed fixed-window rate limiter backed by Redis (INCR + EXPIRE).
 * Keyed by API key / user / client IP. Applied globally; tune per route with
 * {@link RateLimit} or disable with {@link SkipRateLimit}.
 */
@Injectable()
export class RateLimitGuard implements CanActivate {
  constructor(
    private readonly redis: RedisService,
    private readonly reflector: Reflector,
    private readonly config: AppConfigService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const skip = this.reflector.getAllAndOverride<boolean>(SKIP_RATE_LIMIT_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (skip) return true;

    const request = context.switchToHttp().getRequest<Request>();
    const response = context.switchToHttp().getResponse<Response>();

    const options =
      this.reflector.getAllAndOverride<RateLimitOptions>(RATE_LIMIT_KEY, [
        context.getHandler(),
        context.getClass(),
      ]) ?? { max: this.config.get('RATE_LIMIT_MAX'), windowSec: this.config.get('RATE_LIMIT_WINDOW_SEC') };

    const identity = this.resolveIdentity(request);
    const routeKey = `${request.method}:${request.baseUrl}${request.route?.path ?? request.path}`;
    const windowId = Math.floor(Date.now() / 1000 / options.windowSec);
    const redisKey = `ratelimit:${identity}:${routeKey}:${windowId}`;

    const count = await this.redis.client.incr(redisKey);
    if (count === 1) {
      await this.redis.client.expire(redisKey, options.windowSec);
    }

    const remaining = Math.max(0, options.max - count);
    response.setHeader('X-RateLimit-Limit', options.max);
    response.setHeader('X-RateLimit-Remaining', remaining);

    if (count > options.max) {
      response.setHeader('Retry-After', options.windowSec);
      throw new AppError(ErrorCode.RateLimited, 'Rate limit exceeded. Slow down and retry shortly.');
    }
    return true;
  }

  private resolveIdentity(request: Request): string {
    const apiKey = request.headers['x-api-key'];
    if (typeof apiKey === 'string') return `key:${apiKey.slice(0, 12)}`;
    const auth = (request as Request & { auth?: { user?: { id?: string } } }).auth;
    if (auth?.user?.id) return `user:${auth.user.id}`;
    const forwarded = request.headers['x-forwarded-for'];
    const ip = (typeof forwarded === 'string' ? forwarded.split(',')[0] : undefined) ?? request.ip ?? 'unknown';
    return `ip:${ip}`;
  }
}
