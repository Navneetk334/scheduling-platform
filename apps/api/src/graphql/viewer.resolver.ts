import { Context, Query, Resolver } from '@nestjs/graphql';
import { AppError, ErrorCode } from '@invincible/utils';
import type { Request } from 'express';

import { AuthService } from '../auth/auth.service';
import { TokensService } from '../auth/tokens/tokens.service';
import { OrganizationsService } from '../modules/organizations/organizations.service';

import { ViewerOrganizationType } from './types';

interface GqlContext {
  req: Request;
}

/** Authenticated GraphQL surface. Accepts a Bearer JWT or a session cookie. */
@Resolver()
export class ViewerResolver {
  constructor(
    private readonly auth: AuthService,
    private readonly tokens: TokensService,
    private readonly organizations: OrganizationsService,
  ) {}

  @Query(() => [ViewerOrganizationType], { name: 'myOrganizations' })
  async myOrganizations(@Context() ctx: GqlContext) {
    const userId = await this.resolveUserId(ctx.req);
    return this.organizations.listForUser(userId);
  }

  private async resolveUserId(req: Request): Promise<string> {
    const header = req.headers.authorization;
    if (typeof header === 'string' && header.startsWith('Bearer ')) {
      const claims = await this.tokens.verifyAccess(header.slice(7).trim());
      return claims.sub;
    }
    const session = await this.auth.getSession(req.headers);
    if (!session) throw new AppError(ErrorCode.Unauthorized, 'Authentication is required.');
    return session.user.id;
  }
}
