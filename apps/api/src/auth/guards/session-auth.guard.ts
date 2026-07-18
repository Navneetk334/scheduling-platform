import {
  type CanActivate,
  type ExecutionContext,
  Injectable,
} from '@nestjs/common';
import { AppError, ErrorCode } from '@invincible/utils';
import type { Request } from 'express';

import { AuthService, type SessionContext } from '../auth.service';

/** Express request augmented with the resolved auth session. */
export interface AuthenticatedRequest extends Request {
  auth?: SessionContext;
}

/**
 * Guards routes that require an authenticated session. On success it attaches
 * the resolved {@link SessionContext} to `request.auth` for downstream
 * decorators/handlers.
 */
@Injectable()
export class SessionAuthGuard implements CanActivate {
  constructor(private readonly authService: AuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const session = await this.authService.getSession(request.headers);

    if (!session) {
      throw new AppError(ErrorCode.Unauthorized, 'Authentication is required.');
    }

    request.auth = session;
    return true;
  }
}
