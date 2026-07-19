import { Controller, Get } from '@nestjs/common';
import { listPlans } from '@invincible/utils';

/** Public plan catalog for pricing pages and checkout. */
@Controller({ path: 'public/plans', version: '1' })
export class PlansController {
  @Get()
  list() {
    return listPlans().map((plan) => ({
      tier: plan.tier,
      name: plan.name,
      description: plan.description,
      pricing: plan.pricing,
      limits: plan.limits,
      features: plan.features,
      trialDays: plan.trialDays,
      custom: plan.custom,
    }));
  }
}
