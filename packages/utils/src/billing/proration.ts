/**
 * Mid-cycle proration. When a subscription changes plan/seats partway through a
 * billing period, the customer is credited for the unused portion of the old
 * price and charged for the remaining portion of the new price.
 */
export interface ProrationInput {
  /** Current recurring amount for the period (minor units). */
  oldAmount: number;
  /** New recurring amount for the period (minor units). */
  newAmount: number;
  /** Whole days remaining in the current period. */
  daysRemaining: number;
  /** Total days in the current period. */
  daysInPeriod: number;
}

export interface ProrationResult {
  /** Credit for the unused portion of the old plan (minor units). */
  credit: number;
  /** Charge for the remaining portion of the new plan (minor units). */
  charge: number;
  /** Net amount due now; negative means account credit. */
  net: number;
}

export function prorate(input: ProrationInput): ProrationResult {
  const { oldAmount, newAmount, daysInPeriod } = input;
  const daysRemaining = Math.max(0, Math.min(input.daysRemaining, daysInPeriod));
  if (daysInPeriod <= 0) {
    return { credit: 0, charge: 0, net: 0 };
  }
  const ratio = daysRemaining / daysInPeriod;
  const credit = Math.round(oldAmount * ratio);
  const charge = Math.round(newAmount * ratio);
  return { credit, charge, net: charge - credit };
}
