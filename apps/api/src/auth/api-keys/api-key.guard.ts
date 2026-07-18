import {
  type CanActivate,
  type ExecutionContext,
  Injectable,
  createParamDecorator,
} from '@nestjs/common';
import { AppError, ErrorCode } from '@invincible/utils';
import type { Request } from 'express';

import { ApiKeysService, type ApiKeyContext } from './api-keys.service';

export interface ApiKeyRequest extends Request {
  apiKey?: ApiKeyContext;
}

/**
 * Authenticates machine-to-machine callers via the `x-api-key` header.
 * Attaches the resolved {@link ApiKeyContext} (org + scopes) to the request.
 */
@Injectable()
export class ApiKeyGuard implements CanActivate {
  constructor(private readonly apiKeys: ApiKeysService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<ApiKeyRequest>();
    const header = request.headers['x-api-key'];
    const raw = typeof header === 'string' ? header : undefined;

    if (!raw) {
      throw new AppError(ErrorCode.Unauthorized, 'Missing x-api-key header.');
    }
    const resolved = await this.apiKeys.verify(raw);
    if (!resolved) {
      throw new AppError(ErrorCode.Unauthorized, 'Invalid or revoked API key.');
    }
    request.apiKey = resolved;
    return true;
  }
}

/** Injects the organization id resolved from the API key. */
export const ApiKeyOrganizationId = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): string => {
    const request = ctx.switchToHttp().getRequest<ApiKeyRequest>();
    if (!request.apiKey) throw new Error('ApiKeyOrganizationId used without ApiKeyGuard.');
    return request.apiKey.organizationId;
  },
);
