import {
  type CanActivate,
  type ExecutionContext,
  Injectable,
} from '@nestjs/common';
import { AppError, ErrorCode } from '@invincible/utils';
import type { Request } from 'express';

import { TokensService } from '../tokens/tokens.service';
import { AuthService, type SessionContext } from '../auth.service';

/** Express request augmented with the resolved auth session. */
export interface AuthenticatedRequest extends Request {
  auth?: SessionContext;
}

/**
 * Guards routes that require an authenticated principal. Accepts either a
 * Better Auth session cookie OR a Bearer JWT access token, normalizing both
 * into `request.auth`.
 */
@Injectable()
export class SessionAuthGuard implements CanActivate {
  constructor(
    private readonly authService: AuthService,
    private readonly tokens: TokensService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();

    // 1) Bearer JWT (stateless clients).
    const bearer = this.extractBearer(request);
    if (bearer) {
      const claims = await this.tokens.verifyAccess(bearer);
      request.auth = {
        user: { id: claims.sub, email: claims.email, name: claims.name },
        session: { id: 'jwt', userId: claims.sub, activeOrganizationId: null },
      };
      return true;
    }

    // 2) Better Auth session cookie.
    const session = await this.authService.getSession(request.headers);
    if (!session) {
      throw new AppError(ErrorCode.Unauthorized, 'Authentication is required.');
    }
    request.auth = session;
    return true;
  }

  private extractBearer(request: Request): string | null {
    const header = request.headers.authorization;
    if (typeof header === 'string' && header.startsWith('Bearer ')) {
      return header.slice('Bearer '.length).trim();
    }
    return null;
  }
}
