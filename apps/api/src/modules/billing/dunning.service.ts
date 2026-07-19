import { Injectable, Logger } from '@nestjs/common';
import { dunningSchedule, getPlan, gracePeriodEnd, isPlanTier } from '@invincible/utils';

import { PrismaService } from '../../prisma/prisma.service';

/**
 * Failed-payment recovery (dunning). On a failed charge the subscription enters
 * PAST_DUE within a grace window; retries follow the plan's dunning schedule.
 * A billing cron drives retries and downgrades to UNPAID after the grace period.
 */
@Injectable()
export class DunningService {
  private readonly logger = new Logger(DunningService.name);

  constructor(private readonly prisma: PrismaService) {}

  async handleFailedPayment(organizationId: string, reason: string): Promise<void> {
    const sub = await this.prisma.subscription.findUnique({
      where: { organizationId },
      include: { plan: true },
    });
    if (!sub) return;

    const tier = isPlanTier(sub.plan.key) ? sub.plan.key : 'free';
    const graceDays = getPlan(tier).gracePeriodDays;
    const graceEnd = gracePeriodEnd(sub.currentPeriodEnd ?? new Date(), graceDays);

    await this.prisma.subscription.update({
      where: { organizationId },
      data: { status: 'PAST_DUE', lastPaymentFailedAt: new Date(), gracePeriodEndsAt: graceEnd },
    });
    this.logger.warn(`Payment failed for ${organizationId}: ${reason}. Grace ends ${graceEnd.toISOString()}.`);
  }

  /** Retry offsets (days after failure) for a tier's grace window. */
  retryOffsets(tier: string): number[] {
    const resolved = isPlanTier(tier) ? tier : 'free';
    return dunningSchedule(getPlan(resolved).gracePeriodDays);
  }

  /** Move subscriptions whose grace period has lapsed to UNPAID. */
  async expireLapsed(now: Date = new Date()): Promise<number> {
    const result = await this.prisma.subscription.updateMany({
      where: { status: 'PAST_DUE', gracePeriodEndsAt: { lt: now } },
      data: { status: 'UNPAID' },
    });
    return result.count;
  }
}
