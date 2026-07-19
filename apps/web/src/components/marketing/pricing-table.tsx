'use client';

import { UNLIMITED, listPlans, type Plan } from '@invincible/utils';
import { Badge, Button, cn } from '@invincible/ui';
import { Check } from 'lucide-react';
import Link from 'next/link';
import * as React from 'react';

import { formatMoney } from '@/lib/format';

type Cycle = 'monthly' | 'yearly';

const POPULAR: Plan['tier'] = 'professional';

function limitLabel(value: number, unit = ''): string {
  if (value === UNLIMITED) return 'Unlimited';
  return `${value.toLocaleString()}${unit ? ` ${unit}` : ''}`;
}

/** Human-readable highlight list per plan, derived from the real catalog. */
function planHighlights(plan: Plan): string[] {
  const lines: string[] = [];
  lines.push(plan.limits.seats === UNLIMITED ? 'Unlimited team members' : `${plan.limits.seats} team member${plan.limits.seats > 1 ? 's' : ''}`);
  lines.push(`${limitLabel(plan.limits.meetingTypes)} meeting types`);
  lines.push(`${limitLabel(plan.limits.bookingsPerMonth)} bookings / mo`);
  lines.push(`${limitLabel(plan.limits.calendars)} connected calendars`);
  lines.push(`${limitLabel(plan.limits.storageGb, 'GB')} storage`);
  if (plan.limits.teams > 0 || plan.limits.teams === UNLIMITED) {
    lines.push(`${limitLabel(plan.limits.teams)} teams`);
  }
  if (plan.features.customDomain) lines.push('Custom domain');
  if (plan.features.whiteLabel) lines.push('White-label branding');
  if (plan.features.sso) lines.push('SSO / SAML');
  if (plan.features.prioritySupport) lines.push('Priority support');
  return lines;
}

export function PricingTable({ className }: { className?: string }) {
  const [cycle, setCycle] = React.useState<Cycle>('monthly');
  const plans = React.useMemo(() => listPlans(), []);

  return (
    <div className={className}>
      {/* Billing cycle toggle */}
      <div className="flex items-center justify-center">
        <div
          role="group"
          aria-label="Billing cycle"
          className="inline-flex items-center rounded-full border border-border bg-muted/50 p-1"
        >
          {(['monthly', 'yearly'] as const).map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setCycle(c)}
              aria-pressed={cycle === c}
              className={cn(
                'relative rounded-full px-4 py-1.5 text-sm font-medium transition-colors',
                cycle === c ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground',
              )}
            >
              {c === 'monthly' ? 'Monthly' : 'Yearly'}
              {c === 'yearly' ? (
                <span className="ml-1.5 text-xs font-semibold text-primary">-17%</span>
              ) : null}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-10 grid gap-6 lg:grid-cols-3 xl:grid-cols-5">
        {plans.map((plan) => {
          const popular = plan.tier === POPULAR;
          const price = cycle === 'monthly' ? plan.pricing.monthly : plan.pricing.yearly;
          return (
            <div
              key={plan.tier}
              className={cn(
                'relative flex flex-col rounded-2xl border p-6 transition-shadow',
                popular
                  ? 'border-primary/50 bg-card shadow-lg ring-1 ring-primary/20'
                  : 'border-border bg-card/50 hover:shadow-md',
              )}
            >
              {popular ? (
                <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-primary to-accent text-primary-foreground">
                  Most popular
                </Badge>
              ) : null}

              <h3 className="text-lg font-semibold">{plan.name}</h3>
              <p className="mt-1 min-h-10 text-sm text-muted-foreground">{plan.description}</p>

              <div className="mt-4">
                {plan.custom ? (
                  <div className="text-3xl font-semibold tracking-tight">Custom</div>
                ) : (
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-semibold tracking-tight">
                      {formatMoney(price, plan.pricing.currency)}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      /{cycle === 'monthly' ? 'mo' : 'yr'}
                      {plan.features.seatBased ? ' · seat' : ''}
                    </span>
                  </div>
                )}
                {plan.trialDays > 0 && !plan.custom ? (
                  <p className="mt-1 text-xs text-muted-foreground">{plan.trialDays}-day free trial</p>
                ) : (
                  <p className="mt-1 text-xs text-muted-foreground">&nbsp;</p>
                )}
              </div>

              <Button
                className="mt-5 w-full"
                variant={popular ? 'primary' : 'outline'}
                asChild
              >
                <Link href={plan.custom ? '/contact' : '/signup'}>
                  {plan.custom ? 'Contact sales' : plan.pricing.monthly === 0 ? 'Start free' : 'Start trial'}
                </Link>
              </Button>

              <ul className="mt-6 space-y-2.5 text-sm">
                {planHighlights(plan).map((line) => (
                  <li key={line} className="flex items-start gap-2">
                    <Check className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
                    <span className="text-muted-foreground">{line}</span>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
    </div>
  );
}
