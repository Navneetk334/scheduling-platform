import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { z } from 'zod';

import { SessionAuthGuard } from '../../auth/guards/session-auth.guard';
import { ActiveOrganizationId } from '../../common/decorators/active-organization.decorator';
import { OrgMembershipGuard } from '../../common/guards/org-membership.guard';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';

import { BillingAnalyticsService } from './billing-analytics.service';
import { EntitlementsService } from './entitlements.service';
import { SubscriptionsService } from './subscriptions.service';

const subscribeSchema = z.object({
  planKey: z.enum(['free', 'starter', 'professional', 'business', 'enterprise']),
  interval: z.enum(['MONTH', 'YEAR']).default('MONTH'),
  seats: z.number().int().min(1).max(1000).default(1),
  couponCode: z.string().trim().min(1).max(60).optional(),
  country: z.string().length(2).optional(),
  gateway: z.enum(['STRIPE', 'PAYPAL', 'RAZORPAY', 'MANUAL']).optional(),
});

const changePlanSchema = z.object({
  planKey: z.enum(['free', 'starter', 'professional', 'business', 'enterprise']),
  interval: z.enum(['MONTH', 'YEAR']).optional(),
  seats: z.number().int().min(1).max(1000).optional(),
});

const cancelSchema = z.object({ atPeriodEnd: z.boolean().default(true) });

@Controller({ path: 'billing', version: '1' })
@UseGuards(SessionAuthGuard, OrgMembershipGuard)
export class BillingController {
  constructor(
    private readonly subscriptions: SubscriptionsService,
    private readonly entitlements: EntitlementsService,
    private readonly analytics: BillingAnalyticsService,
  ) {}

  @Get('subscription')
  subscription(@ActiveOrganizationId() organizationId: string) {
    return this.subscriptions.getSubscription(organizationId);
  }

  @Get('entitlements')
  getEntitlements(@ActiveOrganizationId() organizationId: string) {
    return this.entitlements.getEntitlements(organizationId);
  }

  @Get('invoices')
  invoices(@ActiveOrganizationId() organizationId: string) {
    return this.subscriptions.listInvoices(organizationId);
  }

  @Post('subscribe')
  subscribe(
    @ActiveOrganizationId() organizationId: string,
    @Body(new ZodValidationPipe(subscribeSchema)) body: z.infer<typeof subscribeSchema>,
  ) {
    return this.subscriptions.subscribe(organizationId, body);
  }

  @Post('change-plan')
  changePlan(
    @ActiveOrganizationId() organizationId: string,
    @Body(new ZodValidationPipe(changePlanSchema)) body: z.infer<typeof changePlanSchema>,
  ) {
    return this.subscriptions.changePlan(organizationId, body);
  }

  @Post('cancel')
  cancel(
    @ActiveOrganizationId() organizationId: string,
    @Body(new ZodValidationPipe(cancelSchema)) body: { atPeriodEnd: boolean },
  ) {
    return this.subscriptions.cancel(organizationId, body.atPeriodEnd);
  }

  @Post('resume')
  resume(@ActiveOrganizationId() organizationId: string) {
    return this.subscriptions.resume(organizationId);
  }

  // NOTE: platform-wide analytics — gate behind a super-admin role once provisioned.
  @Get('analytics')
  analyticsSummary() {
    return this.analytics.summary();
  }
}
