import { Injectable } from '@nestjs/common';
import {
  AppError,
  ErrorCode,
  checkEntitlements,
  getPlan,
  isPlanTier,
  remaining,
  type LimitKey,
  type PlanTier,
} from '@invincible/utils';

import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class EntitlementsService {
  constructor(private readonly prisma: PrismaService) {}

  /** Resolve the org's active plan tier (defaults to Free with no subscription). */
  async resolveTier(organizationId: string): Promise<PlanTier> {
    const sub = await this.prisma.subscription.findUnique({
      where: { organizationId },
      include: { plan: true },
    });
    const key = sub?.plan.key;
    return key && isPlanTier(key) ? key : 'free';
  }

  /** Live usage counts for the limit dimensions we track today. */
  async currentUsage(organizationId: string): Promise<Partial<Record<LimitKey, number>>> {
    const monthStart = new Date();
    monthStart.setUTCDate(1);
    monthStart.setUTCHours(0, 0, 0, 0);

    const [seats, meetingTypes, teams, calendars, bookingsPerMonth] = await Promise.all([
      this.prisma.membership.count({ where: { organizationId, status: 'ACTIVE' } }),
      this.prisma.meetingType.count({ where: { organizationId, deletedAt: null } }),
      this.prisma.team.count({ where: { organizationId } }),
      this.prisma.calendarConnection.count({ where: { organizationId } }),
      this.prisma.booking.count({ where: { organizationId, createdAt: { gte: monthStart } } }),
    ]);

    return { seats, meetingTypes, teams, calendars, bookingsPerMonth, organizations: 1 };
  }

  async getEntitlements(organizationId: string) {
    const tier = await this.resolveTier(organizationId);
    const plan = getPlan(tier);
    const usage = await this.currentUsage(organizationId);

    const remainingByKey = Object.fromEntries(
      (Object.keys(plan.limits) as LimitKey[]).map((key) => [
        key,
        remaining(usage[key] ?? 0, plan.limits[key]),
      ]),
    ) as Record<LimitKey, number>;

    return {
      tier,
      limits: plan.limits,
      features: plan.features,
      usage,
      remaining: remainingByKey,
      violations: checkEntitlements(plan.limits, usage),
    };
  }

  /** Throw FORBIDDEN when consuming `delta` of `key` would exceed the plan. */
  async assertCanConsume(organizationId: string, key: LimitKey, delta = 1): Promise<void> {
    const tier = await this.resolveTier(organizationId);
    const plan = getPlan(tier);
    const usage = await this.currentUsage(organizationId);
    const violations = checkEntitlements(plan.limits, { [key]: (usage[key] ?? 0) + delta });
    if (violations.length > 0) {
      throw new AppError(
        ErrorCode.Forbidden,
        `Your ${plan.name} plan limit for ${key} has been reached. Upgrade to continue.`,
        { details: { limit: plan.limits[key], key } },
      );
    }
  }
}
