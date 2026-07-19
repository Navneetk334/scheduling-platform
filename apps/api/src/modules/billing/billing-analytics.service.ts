import { Injectable } from '@nestjs/common';
import { getPlan, isPlanTier } from '@invincible/utils';

import { PrismaService } from '../../prisma/prisma.service';

/** Subscription revenue analytics: MRR, ARR, and churn. */
@Injectable()
export class BillingAnalyticsService {
  constructor(private readonly prisma: PrismaService) {}

  async summary() {
    const subs = await this.prisma.subscription.findMany({
      where: { status: { in: ['ACTIVE', 'PAST_DUE'] } },
      include: { plan: true },
    });

    let mrr = 0;
    for (const sub of subs) {
      const tier = isPlanTier(sub.plan.key) ? sub.plan.key : 'free';
      const plan = getPlan(tier);
      const seats = plan.features.seatBased ? sub.seats : 1;
      const monthly =
        sub.interval === 'YEAR'
          ? Math.round((plan.pricing.yearly * seats) / 12)
          : plan.pricing.monthly * seats;
      mrr += monthly;
    }

    const [active, canceled, trialing] = await Promise.all([
      this.prisma.subscription.count({ where: { status: 'ACTIVE' } }),
      this.prisma.subscription.count({ where: { status: 'CANCELED' } }),
      this.prisma.subscription.count({ where: { status: 'TRIALING' } }),
    ]);

    const denominator = active + canceled;
    const churnRatePct = denominator > 0 ? Number(((canceled / denominator) * 100).toFixed(2)) : 0;

    return {
      mrr,
      arr: mrr * 12,
      activeSubscriptions: active,
      trialingSubscriptions: trialing,
      canceledSubscriptions: canceled,
      churnRatePct,
    };
  }

  async byPlan() {
    const grouped = await this.prisma.subscription.groupBy({
      by: ['planId'],
      where: { status: { in: ['ACTIVE', 'TRIALING', 'PAST_DUE'] } },
      _count: { _all: true },
    });
    const plans = await this.prisma.plan.findMany({
      where: { id: { in: grouped.map((g) => g.planId) } },
    });
    const nameById = new Map(plans.map((p) => [p.id, p.name]));
    return grouped.map((g) => ({ plan: nameById.get(g.planId) ?? 'Unknown', count: g._count._all }));
  }
}
