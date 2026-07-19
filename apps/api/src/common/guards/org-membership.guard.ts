import type { Membership } from '@invincible/database';
import { AppError, ErrorCode } from '@invincible/utils';
import {
  type CanActivate,
  type ExecutionContext,
  Injectable,
} from '@nestjs/common';

import type { AuthenticatedRequest } from '../../auth/guards/session-auth.guard';
import { OrganizationsService } from '../../modules/organizations/organizations.service';

export interface TenantRequest extends AuthenticatedRequest {
  tenant?: { organizationId: string; membership: Membership };
}

/**
 * Resolves the active organization from the `x-organization-id` header (or the
 * session's active org) and verifies the authenticated user is a member.
 * Must run after {@link SessionAuthGuard}.
 */
@Injectable()
export class OrgMembershipGuard implements CanActivate {
  constructor(private readonly organizations: OrganizationsService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<TenantRequest>();
    if (!request.auth) {
      throw new AppError(ErrorCode.Unauthorized, 'Authentication is required.');
    }

    const headerOrg = request.headers['x-organization-id'];
    const organizationId =
      (typeof headerOrg === 'string' ? headerOrg : undefined) ??
      request.auth.session.activeOrganizationId ??
      undefined;

    if (!organizationId) {
      throw new AppError(
        ErrorCode.Forbidden,
        'No active organization. Provide the x-organization-id header.',
      );
    }

    const membership = await this.organizations.requireMembership(
      organizationId,
      request.auth.user.id,
    );
    request.tenant = { organizationId, membership };
    return true;
  }
}
