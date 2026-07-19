/**
 * Canonical plan catalog. Pricing is in integer minor units (cents). A limit of
 * {@link UNLIMITED} (-1) means no cap. Persisted `Plan` rows mirror pricing;
 * entitlements live here as the single source of truth.
 */

export const UNLIMITED = -1;

export const PlanTier = {
  Free: 'free',
  Starter: 'starter',
  Professional: 'professional',
  Business: 'business',
  Enterprise: 'enterprise',
} as const;
export type PlanTier = (typeof PlanTier)[keyof typeof PlanTier];

export interface PlanLimits {
  seats: number;
  organizations: number;
  storageGb: number;
  calendars: number;
  meetingTypes: number;
  bookingsPerMonth: number;
  apiRequestsPerMonth: number;
  teams: number;
}

export interface PlanFeatures {
  customDomain: boolean;
  whiteLabel: boolean;
  prioritySupport: boolean;
  /** Price is charged per seat rather than a flat fee. */
  seatBased: boolean;
  /** Usage beyond limits is billed as overage. */
  usageBased: boolean;
  sso: boolean;
}

export interface PlanPricing {
  /** Per month (per seat when `features.seatBased`). Minor units. */
  monthly: number;
  /** Per year (per seat when `features.seatBased`). Minor units. */
  yearly: number;
  currency: string;
}

export interface PlanOverage {
  bookingBlockSize: number;
  perBookingBlock: number;
  perStorageGb: number;
  apiBlockSize: number;
  perApiBlock: number;
}

export interface Plan {
  tier: PlanTier;
  name: string;
  description: string;
  pricing: PlanPricing;
  limits: PlanLimits;
  features: PlanFeatures;
  overage: PlanOverage;
  trialDays: number;
  gracePeriodDays: number;
  /** Enterprise pricing is negotiated; UI shows "Contact sales". */
  custom: boolean;
  sortOrder: number;
}

const NO_OVERAGE: PlanOverage = {
  bookingBlockSize: 0,
  perBookingBlock: 0,
  perStorageGb: 0,
  apiBlockSize: 0,
  perApiBlock: 0,
};

export const PLAN_CATALOG: Record<PlanTier, Plan> = {
  free: {
    tier: PlanTier.Free,
    name: 'Free',
    description: 'For individuals getting started.',
    pricing: { monthly: 0, yearly: 0, currency: 'usd' },
    limits: {
      seats: 1,
      organizations: 1,
      storageGb: 1,
      calendars: 1,
      meetingTypes: 2,
      bookingsPerMonth: 50,
      apiRequestsPerMonth: 1_000,
      teams: 0,
    },
    features: { customDomain: false, whiteLabel: false, prioritySupport: false, seatBased: false, usageBased: false, sso: false },
    overage: NO_OVERAGE,
    trialDays: 0,
    gracePeriodDays: 3,
    custom: false,
    sortOrder: 0,
  },
  starter: {
    tier: PlanTier.Starter,
    name: 'Starter',
    description: 'For freelancers and solo professionals.',
    pricing: { monthly: 1_200, yearly: 12_000, currency: 'usd' },
    limits: {
      seats: 3,
      organizations: 1,
      storageGb: 5,
      calendars: 3,
      meetingTypes: 10,
      bookingsPerMonth: 1_000,
      apiRequestsPerMonth: 20_000,
      teams: 1,
    },
    features: { customDomain: false, whiteLabel: false, prioritySupport: false, seatBased: false, usageBased: false, sso: false },
    overage: NO_OVERAGE,
    trialDays: 14,
    gracePeriodDays: 7,
    custom: false,
    sortOrder: 1,
  },
  professional: {
    tier: PlanTier.Professional,
    name: 'Professional',
    description: 'For growing teams that book at scale.',
    pricing: { monthly: 2_900, yearly: 29_000, currency: 'usd' },
    limits: {
      seats: UNLIMITED,
      organizations: 3,
      storageGb: 25,
      calendars: 10,
      meetingTypes: UNLIMITED,
      bookingsPerMonth: 10_000,
      apiRequestsPerMonth: 200_000,
      teams: 10,
    },
    features: { customDomain: true, whiteLabel: false, prioritySupport: true, seatBased: true, usageBased: true, sso: false },
    overage: { bookingBlockSize: 1_000, perBookingBlock: 1_000, perStorageGb: 50, apiBlockSize: 100_000, perApiBlock: 500 },
    trialDays: 14,
    gracePeriodDays: 7,
    custom: false,
    sortOrder: 2,
  },
  business: {
    tier: PlanTier.Business,
    name: 'Business',
    description: 'For organizations that need control and scale.',
    pricing: { monthly: 4_900, yearly: 49_000, currency: 'usd' },
    limits: {
      seats: UNLIMITED,
      organizations: 10,
      storageGb: 100,
      calendars: UNLIMITED,
      meetingTypes: UNLIMITED,
      bookingsPerMonth: 100_000,
      apiRequestsPerMonth: 2_000_000,
      teams: 50,
    },
    features: { customDomain: true, whiteLabel: true, prioritySupport: true, seatBased: true, usageBased: true, sso: true },
    overage: { bookingBlockSize: 1_000, perBookingBlock: 800, perStorageGb: 40, apiBlockSize: 100_000, perApiBlock: 400 },
    trialDays: 14,
    gracePeriodDays: 14,
    custom: false,
    sortOrder: 3,
  },
  enterprise: {
    tier: PlanTier.Enterprise,
    name: 'Enterprise',
    description: 'Custom limits, SSO, white-label, and priority SLAs.',
    pricing: { monthly: 0, yearly: 0, currency: 'usd' },
    limits: {
      seats: UNLIMITED,
      organizations: UNLIMITED,
      storageGb: UNLIMITED,
      calendars: UNLIMITED,
      meetingTypes: UNLIMITED,
      bookingsPerMonth: UNLIMITED,
      apiRequestsPerMonth: UNLIMITED,
      teams: UNLIMITED,
    },
    features: { customDomain: true, whiteLabel: true, prioritySupport: true, seatBased: true, usageBased: true, sso: true },
    overage: NO_OVERAGE,
    trialDays: 30,
    gracePeriodDays: 30,
    custom: true,
    sortOrder: 4,
  },
};

export function getPlan(tier: PlanTier): Plan {
  return PLAN_CATALOG[tier];
}

export function listPlans(): Plan[] {
  return Object.values(PLAN_CATALOG).sort((a, b) => a.sortOrder - b.sortOrder);
}

export function isPlanTier(value: string): value is PlanTier {
  return value in PLAN_CATALOG;
}

/** > 0 when `a` is a higher tier than `b` (upgrade), < 0 when lower (downgrade). */
export function comparePlans(a: PlanTier, b: PlanTier): number {
  return PLAN_CATALOG[a].sortOrder - PLAN_CATALOG[b].sortOrder;
}
