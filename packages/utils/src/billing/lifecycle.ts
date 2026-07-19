import { DateTime } from 'luxon';

export type BillingInterval = 'MONTH' | 'YEAR';

export type SubscriptionStatus =
  | 'TRIALING'
  | 'ACTIVE'
  | 'PAST_DUE'
  | 'CANCELED'
  | 'UNPAID'
  | 'INCOMPLETE';

export function addInterval(from: Date, interval: BillingInterval, count = 1): Date {
  const dt = DateTime.fromJSDate(from);
  return (interval === 'YEAR' ? dt.plus({ years: count }) : dt.plus({ months: count })).toJSDate();
}

export function trialEnd(start: Date, trialDays: number): Date | null {
  return trialDays > 0 ? DateTime.fromJSDate(start).plus({ days: trialDays }).toJSDate() : null;
}

export function gracePeriodEnd(periodEnd: Date, graceDays: number): Date {
  return DateTime.fromJSDate(periodEnd).plus({ days: graceDays }).toJSDate();
}

export function nextRenewalDate(periodStart: Date, interval: BillingInterval): Date {
  return addInterval(periodStart, interval);
}

export function isInTrial(trialEndsAt: Date | null, now: Date = new Date()): boolean {
  return trialEndsAt !== null && now.getTime() < trialEndsAt.getTime();
}

export function isInGracePeriod(periodEnd: Date, graceDays: number, now: Date = new Date()): boolean {
  const end = gracePeriodEnd(periodEnd, graceDays);
  return now.getTime() >= periodEnd.getTime() && now.getTime() < end.getTime();
}

export interface StatusInput {
  now: Date;
  trialEndsAt: Date | null;
  currentPeriodEnd: Date | null;
  graceDays: number;
  canceledAt: Date | null;
  cancelAtPeriodEnd: boolean;
  lastPaymentFailed: boolean;
}

/**
 * Derive the effective subscription status from lifecycle dates + payment
 * state. Pure and deterministic, so it can drive both the API and jobs.
 */
export function deriveStatus(input: StatusInput): SubscriptionStatus {
  const { now, trialEndsAt, currentPeriodEnd, graceDays, canceledAt, cancelAtPeriodEnd, lastPaymentFailed } = input;

  if (canceledAt && now.getTime() >= canceledAt.getTime()) return 'CANCELED';
  if (isInTrial(trialEndsAt, now)) return 'TRIALING';
  if (!currentPeriodEnd) return 'INCOMPLETE';

  const expired = now.getTime() >= currentPeriodEnd.getTime();
  if (expired && cancelAtPeriodEnd) return 'CANCELED';

  if (lastPaymentFailed) {
    return isInGracePeriod(currentPeriodEnd, graceDays, now) ? 'PAST_DUE' : 'UNPAID';
  }
  return 'ACTIVE';
}

/** Dunning retry offsets (days after failure) within a grace window. */
export function dunningSchedule(graceDays: number): number[] {
  return [1, 3, 5, 7].filter((d) => d <= graceDays);
}
