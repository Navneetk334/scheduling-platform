import { UNLIMITED, type PlanLimits } from './plans';

export type LimitKey = keyof PlanLimits;

export function isUnlimited(limit: number): boolean {
  return limit === UNLIMITED;
}

/** True if `usage` is within `limit` (unlimited always passes). */
export function withinLimit(usage: number, limit: number): boolean {
  return isUnlimited(limit) || usage <= limit;
}

/** Remaining allowance; `Infinity` when unlimited. */
export function remaining(usage: number, limit: number): number {
  return isUnlimited(limit) ? Infinity : Math.max(0, limit - usage);
}

export interface EntitlementViolation {
  key: LimitKey;
  usage: number;
  limit: number;
}

/**
 * Compare current usage against plan limits and return any violations. Only the
 * usage keys supplied are checked, so callers can validate a single action
 * (e.g. creating one more meeting type) or a full snapshot.
 */
export function checkEntitlements(
  limits: PlanLimits,
  usage: Partial<Record<LimitKey, number>>,
): EntitlementViolation[] {
  const violations: EntitlementViolation[] = [];
  for (const key of Object.keys(usage) as LimitKey[]) {
    const used = usage[key];
    if (used === undefined) continue;
    if (!withinLimit(used, limits[key])) {
      violations.push({ key, usage: used, limit: limits[key] });
    }
  }
  return violations;
}

/** True if adding `delta` to `current` would stay within the limit. */
export function canConsume(current: number, delta: number, limit: number): boolean {
  return withinLimit(current + delta, limit);
}
