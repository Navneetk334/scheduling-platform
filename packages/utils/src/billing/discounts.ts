/** Discount + coupon primitives. All amounts are integer minor units. */

export const DiscountType = { Percent: 'PERCENT', Fixed: 'FIXED' } as const;
export type DiscountType = (typeof DiscountType)[keyof typeof DiscountType];

export const DiscountSource = {
  Coupon: 'COUPON',
  Campaign: 'CAMPAIGN',
  Referral: 'REFERRAL',
} as const;
export type DiscountSource = (typeof DiscountSource)[keyof typeof DiscountSource];

export interface Discount {
  type: DiscountType;
  /** Percent (0–100) or fixed minor units, per `type`. */
  value: number;
  source: DiscountSource;
  code?: string;
}

/** Amount discounted by a single discount, capped at the base amount. */
export function applyDiscount(amount: number, discount: Discount): number {
  if (amount <= 0) return 0;
  const raw = discount.type === DiscountType.Percent
    ? Math.floor((amount * clampPercent(discount.value)) / 100)
    : discount.value;
  return Math.max(0, Math.min(raw, amount));
}

export interface DiscountResult {
  discountTotal: number;
  net: number;
  applied: Array<{ source: DiscountSource; code?: string; amount: number }>;
}

/**
 * Apply discounts sequentially (percent discounts compound on the reducing
 * balance, matching common billing behavior). Net is floored at zero.
 */
export function applyDiscounts(amount: number, discounts: Discount[]): DiscountResult {
  let net = Math.max(0, amount);
  const applied: DiscountResult['applied'] = [];
  for (const discount of discounts) {
    const amt = applyDiscount(net, discount);
    if (amt > 0) {
      applied.push({ source: discount.source, code: discount.code, amount: amt });
      net -= amt;
    }
  }
  return { discountTotal: Math.max(0, amount) - net, net, applied };
}

export function referralDiscount(percent: number): Discount {
  return { type: DiscountType.Percent, value: clampPercent(percent), source: DiscountSource.Referral };
}

export interface CouponState {
  isActive: boolean;
  expiresAt: Date | null;
  maxRedemptions: number | null;
  timesRedeemed: number;
}

export type CouponValidity =
  | { valid: true }
  | { valid: false; reason: 'inactive' | 'expired' | 'exhausted' };

export function validateCoupon(coupon: CouponState, now: Date = new Date()): CouponValidity {
  if (!coupon.isActive) return { valid: false, reason: 'inactive' };
  if (coupon.expiresAt && coupon.expiresAt.getTime() < now.getTime()) {
    return { valid: false, reason: 'expired' };
  }
  if (coupon.maxRedemptions !== null && coupon.timesRedeemed >= coupon.maxRedemptions) {
    return { valid: false, reason: 'exhausted' };
  }
  return { valid: true };
}

function clampPercent(value: number): number {
  return Math.max(0, Math.min(100, value));
}
