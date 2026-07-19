import type { BillingInterval } from './lifecycle';
import { type Plan } from './plans';

/** Per-unit price for a plan on an interval (per seat when seat-based). */
export function unitPrice(plan: Plan, interval: BillingInterval): number {
  return interval === 'YEAR' ? plan.pricing.yearly : plan.pricing.monthly;
}

export interface UsageSnapshot {
  bookings?: number;
  storageGb?: number;
  apiRequests?: number;
}

/** Base recurring cost before discounts/tax (seats × unit price when seat-based). */
export function computeBaseCost(plan: Plan, interval: BillingInterval, seats: number): number {
  const price = unitPrice(plan, interval);
  if (plan.features.seatBased) {
    return price * Math.max(1, seats);
  }
  return price;
}

/** Metered overage for usage beyond plan limits (0 unless the plan meters usage). */
export function computeOverage(plan: Plan, usage: UsageSnapshot): number {
  if (!plan.features.usageBased) return 0;
  const { overage, limits } = plan;
  let total = 0;

  if (overage.bookingBlockSize > 0 && limits.bookingsPerMonth !== -1) {
    const over = Math.max(0, (usage.bookings ?? 0) - limits.bookingsPerMonth);
    total += Math.ceil(over / overage.bookingBlockSize) * overage.perBookingBlock;
  }
  if (overage.perStorageGb > 0 && limits.storageGb !== -1) {
    const over = Math.max(0, (usage.storageGb ?? 0) - limits.storageGb);
    total += Math.ceil(over) * overage.perStorageGb;
  }
  if (overage.apiBlockSize > 0 && limits.apiRequestsPerMonth !== -1) {
    const over = Math.max(0, (usage.apiRequests ?? 0) - limits.apiRequestsPerMonth);
    total += Math.ceil(over / overage.apiBlockSize) * overage.perApiBlock;
  }
  return total;
}

export interface SubscriptionCost {
  base: number;
  overage: number;
  total: number;
}

export function computeSubscriptionCost(
  plan: Plan,
  interval: BillingInterval,
  seats: number,
  usage: UsageSnapshot = {},
): SubscriptionCost {
  const base = computeBaseCost(plan, interval, seats);
  const overage = computeOverage(plan, usage);
  return { base, overage, total: base + overage };
}
