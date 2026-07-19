import { describe, expect, it } from 'vitest';

import {
  applyDiscount,
  applyDiscounts,
  buildInvoice,
  calculateTax,
  canConsume,
  checkEntitlements,
  comparePlans,
  computeBaseCost,
  computeOverage,
  computeSubscriptionCost,
  deriveStatus,
  dunningSchedule,
  getPlan,
  isInGracePeriod,
  isInTrial,
  listPlans,
  nextRenewalDate,
  prorate,
  referralDiscount,
  remaining,
  resolveTaxRate,
  trialEnd,
  validateCoupon,
  withinLimit,
  DiscountType,
  DiscountSource,
  PlanTier,
  TaxType,
} from './index';

describe('plan catalog', () => {
  it('exposes five ordered tiers', () => {
    const plans = listPlans();
    expect(plans.map((p) => p.tier)).toEqual(['free', 'starter', 'professional', 'business', 'enterprise']);
  });
  it('compares tiers for upgrade/downgrade', () => {
    expect(comparePlans(PlanTier.Professional, PlanTier.Starter)).toBeGreaterThan(0);
    expect(comparePlans(PlanTier.Free, PlanTier.Business)).toBeLessThan(0);
  });
  it('marks enterprise as custom + unlimited', () => {
    const ent = getPlan(PlanTier.Enterprise);
    expect(ent.custom).toBe(true);
    expect(ent.limits.bookingsPerMonth).toBe(-1);
    expect(ent.features.whiteLabel).toBe(true);
  });
});

describe('entitlements', () => {
  const limits = getPlan(PlanTier.Starter).limits;
  it('enforces finite limits and treats -1 as unlimited', () => {
    expect(withinLimit(3, limits.seats)).toBe(true);
    expect(withinLimit(4, limits.seats)).toBe(false);
    expect(withinLimit(9_999, getPlan(PlanTier.Professional).limits.meetingTypes)).toBe(true);
    expect(remaining(2, limits.calendars)).toBe(1);
    expect(remaining(2, getPlan(PlanTier.Business).limits.calendars)).toBe(Infinity);
  });
  it('reports violations for a usage snapshot', () => {
    const v = checkEntitlements(limits, { seats: 5, meetingTypes: 2, bookingsPerMonth: 1_200 });
    expect(v.map((x) => x.key).sort()).toEqual(['bookingsPerMonth', 'seats']);
  });
  it('canConsume respects the limit', () => {
    expect(canConsume(2, 1, limits.calendars)).toBe(true);
    expect(canConsume(3, 1, limits.calendars)).toBe(false);
  });
});

describe('pricing', () => {
  it('charges a flat fee for non-seat plans', () => {
    expect(computeBaseCost(getPlan(PlanTier.Starter), 'MONTH', 3)).toBe(1_200);
  });
  it('charges per seat for seat-based plans', () => {
    expect(computeBaseCost(getPlan(PlanTier.Professional), 'MONTH', 4)).toBe(4 * 2_900);
    expect(computeBaseCost(getPlan(PlanTier.Professional), 'YEAR', 2)).toBe(2 * 29_000);
  });
  it('computes usage overage only when metered', () => {
    const pro = getPlan(PlanTier.Professional);
    // 10,500 bookings vs 10,000 limit → 1 block over.
    expect(computeOverage(pro, { bookings: 10_500 })).toBe(pro.overage.perBookingBlock);
    expect(computeOverage(getPlan(PlanTier.Starter), { bookings: 999_999 })).toBe(0);
  });
  it('combines base + overage', () => {
    const pro = getPlan(PlanTier.Professional);
    const cost = computeSubscriptionCost(pro, 'MONTH', 2, { storageGb: 27 });
    expect(cost.base).toBe(2 * 2_900);
    expect(cost.overage).toBe(2 * pro.overage.perStorageGb);
    expect(cost.total).toBe(cost.base + cost.overage);
  });
});

describe('proration', () => {
  it('credits unused time and charges the new plan pro-rata', () => {
    const result = prorate({ oldAmount: 3_000, newAmount: 6_000, daysRemaining: 15, daysInPeriod: 30 });
    expect(result.credit).toBe(1_500);
    expect(result.charge).toBe(3_000);
    expect(result.net).toBe(1_500);
  });
  it('yields a credit (negative net) on downgrade', () => {
    const result = prorate({ oldAmount: 6_000, newAmount: 3_000, daysRemaining: 10, daysInPeriod: 30 });
    expect(result.net).toBeLessThan(0);
  });
  it('handles zero-length periods safely', () => {
    expect(prorate({ oldAmount: 100, newAmount: 200, daysRemaining: 5, daysInPeriod: 0 }).net).toBe(0);
  });
});

describe('discounts', () => {
  it('applies percent and fixed discounts, capped at the amount', () => {
    expect(applyDiscount(10_000, { type: DiscountType.Percent, value: 25, source: DiscountSource.Coupon })).toBe(2_500);
    expect(applyDiscount(1_000, { type: DiscountType.Fixed, value: 5_000, source: DiscountSource.Coupon })).toBe(1_000);
  });
  it('compounds sequential discounts and floors at zero', () => {
    const result = applyDiscounts(10_000, [
      referralDiscount(10),
      { type: DiscountType.Fixed, value: 2_000, source: DiscountSource.Coupon, code: 'SAVE20' },
    ]);
    // 10,000 → -1,000 (10%) = 9,000 → -2,000 = 7,000
    expect(result.net).toBe(7_000);
    expect(result.discountTotal).toBe(3_000);
    expect(result.applied).toHaveLength(2);
  });
  it('validates coupon state', () => {
    const past = new Date('2020-01-01');
    expect(validateCoupon({ isActive: true, expiresAt: null, maxRedemptions: null, timesRedeemed: 0 })).toEqual({ valid: true });
    expect(validateCoupon({ isActive: false, expiresAt: null, maxRedemptions: null, timesRedeemed: 0 })).toEqual({ valid: false, reason: 'inactive' });
    expect(validateCoupon({ isActive: true, expiresAt: past, maxRedemptions: null, timesRedeemed: 0 })).toEqual({ valid: false, reason: 'expired' });
    expect(validateCoupon({ isActive: true, expiresAt: null, maxRedemptions: 5, timesRedeemed: 5 })).toEqual({ valid: false, reason: 'exhausted' });
  });
});

describe('tax (GST / VAT)', () => {
  it('resolves regional rates', () => {
    expect(resolveTaxRate('IN').type).toBe(TaxType.GST);
    expect(resolveTaxRate('GB').rate).toBe(20);
    expect(resolveTaxRate('ZZ').type).toBe(TaxType.None);
  });
  it('adds exclusive tax', () => {
    const r = calculateTax(10_000, 18, TaxType.GST);
    expect(r.taxAmount).toBe(1_800);
    expect(r.total).toBe(11_800);
  });
  it('extracts inclusive tax', () => {
    const r = calculateTax(12_000, 20, TaxType.VAT, true);
    expect(r.net).toBe(10_000);
    expect(r.taxAmount).toBe(2_000);
    expect(r.total).toBe(12_000);
  });
});

describe('lifecycle', () => {
  const now = new Date('2026-07-15T00:00:00Z');
  it('computes trial and renewal dates', () => {
    const start = new Date('2026-07-01T00:00:00Z');
    expect(trialEnd(start, 14)?.toISOString()).toBe('2026-07-15T00:00:00.000Z');
    expect(trialEnd(start, 0)).toBeNull();
    expect(nextRenewalDate(start, 'MONTH').toISOString()).toBe('2026-08-01T00:00:00.000Z');
    expect(nextRenewalDate(start, 'YEAR').toISOString()).toBe('2027-07-01T00:00:00.000Z');
  });
  it('detects trial and grace windows', () => {
    expect(isInTrial(new Date('2026-07-20Z'), now)).toBe(true);
    expect(isInTrial(new Date('2026-07-10Z'), now)).toBe(false);
    const periodEnd = new Date('2026-07-14T00:00:00Z');
    expect(isInGracePeriod(periodEnd, 7, now)).toBe(true);
  });
  it('derives status from lifecycle + payment state', () => {
    expect(
      deriveStatus({ now, trialEndsAt: new Date('2026-07-20Z'), currentPeriodEnd: null, graceDays: 7, canceledAt: null, cancelAtPeriodEnd: false, lastPaymentFailed: false }),
    ).toBe('TRIALING');
    expect(
      deriveStatus({ now, trialEndsAt: null, currentPeriodEnd: new Date('2026-08-01Z'), graceDays: 7, canceledAt: null, cancelAtPeriodEnd: false, lastPaymentFailed: false }),
    ).toBe('ACTIVE');
    expect(
      deriveStatus({ now, trialEndsAt: null, currentPeriodEnd: new Date('2026-07-14T00:00:00Z'), graceDays: 7, canceledAt: null, cancelAtPeriodEnd: false, lastPaymentFailed: true }),
    ).toBe('PAST_DUE');
    expect(
      deriveStatus({ now, trialEndsAt: null, currentPeriodEnd: new Date('2026-07-01T00:00:00Z'), graceDays: 3, canceledAt: null, cancelAtPeriodEnd: false, lastPaymentFailed: true }),
    ).toBe('UNPAID');
  });
  it('produces a bounded dunning schedule', () => {
    expect(dunningSchedule(7)).toEqual([1, 3, 5, 7]);
    expect(dunningSchedule(3)).toEqual([1, 3]);
  });
});

describe('invoice building', () => {
  it('rolls up lines, discounts, and tax', () => {
    const invoice = buildInvoice({
      lines: [
        { description: 'Professional (2 seats)', quantity: 2, unitAmount: 2_900 },
        { description: 'Booking overage', quantity: 1, unitAmount: 1_000 },
      ],
      discounts: [{ type: DiscountType.Percent, value: 10, source: DiscountSource.Coupon, code: 'LAUNCH10' }],
      tax: { rate: 18, type: TaxType.GST },
    });
    expect(invoice.subtotal).toBe(6_800);
    expect(invoice.discountTotal).toBe(680);
    expect(invoice.taxableAmount).toBe(6_120);
    expect(invoice.taxTotal).toBe(Math.round(6_120 * 0.18));
    expect(invoice.total).toBe(6_120 + Math.round(6_120 * 0.18));
  });
});
