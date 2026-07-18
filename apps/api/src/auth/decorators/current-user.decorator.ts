import { type ExecutionContext, createParamDecorator } from '@nestjs/common';

import type { AuthenticatedRequest } from '../guards/session-auth.guard';
import type { SessionContext } from '../auth.service';

/**
 * Injects the authenticated session (user + session) resolved by
 * {@link SessionAuthGuard}. Guaranteed present on guarded routes.
 */
export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): SessionContext['user'] => {
    const request = ctx.switchToHttp().getRequest<AuthenticatedRequest>();
    if (!request.auth) {
      throw new Error('CurrentUser used on a route without SessionAuthGuard.');
    }
    return request.auth.user;
  },
);

export const CurrentSession = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): SessionContext['session'] => {
    const request = ctx.switchToHttp().getRequest<AuthenticatedRequest>();
    if (!request.auth) {
      throw new Error('CurrentSession used on a route without SessionAuthGuard.');
    }
    return request.auth.session;
  },
);
