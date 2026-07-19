import type { Membership } from '@invincible/database';
import { type ExecutionContext, createParamDecorator } from '@nestjs/common';

import type { TenantRequest } from '../guards/org-membership.guard';

/** Injects the active organization id resolved by {@link OrgMembershipGuard}. */
export const ActiveOrganizationId = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): string => {
    const request = ctx.switchToHttp().getRequest<TenantRequest>();
    if (!request.tenant) {
      throw new Error('ActiveOrganizationId used without OrgMembershipGuard.');
    }
    return request.tenant.organizationId;
  },
);

/** Injects the current user's membership in the active organization. */
export const ActiveMembership = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): Membership => {
    const request = ctx.switchToHttp().getRequest<TenantRequest>();
    if (!request.tenant) {
      throw new Error('ActiveMembership used without OrgMembershipGuard.');
    }
    return request.tenant.membership;
  },
);
