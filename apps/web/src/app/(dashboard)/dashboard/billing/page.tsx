'use client';

import {
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  cn,
} from '@invincible/ui';
import { Check } from 'lucide-react';
import * as React from 'react';

import { PageHeader } from '@/components/dashboard/page-header';

const plans = [
  { key: 'free', name: 'Free', price: '$0', period: '/mo', features: ['1 user', 'Core scheduling', 'Email reminders'], current: false },
  { key: 'pro', name: 'Pro', price: '$15', period: '/mo', features: ['Payments', 'Unlimited meeting types', 'Branding', 'SMS reminders'], current: true },
  { key: 'team', name: 'Team', price: '$49', period: '/mo', features: ['Teams & roles', 'Round robin', 'Analytics', 'Integrations'], current: false },
  { key: 'enterprise', name: 'Enterprise', price: 'Custom', period: '', features: ['SSO/SAML', 'Audit logs', 'White label', 'SLA'], current: false },
];

const usage = [
  { label: 'Bookings', used: 342, limit: 1000 },
  { label: 'Team seats', used: 3, limit: 5 },
  { label: 'Webhooks', used: 2, limit: 10 },
];

export default function BillingPage() {
  return (
    <div>
      <PageHeader title="Billing" description="Manage your plan, usage, and payment method." />

      <Card className="mb-6">
        <CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Current plan</p>
            <p className="text-xl font-semibold">Pro · $15/mo</p>
            <p className="text-sm text-muted-foreground">Renews Aug 21, 2026</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">Manage payment</Button>
            <Button>Upgrade</Button>
          </div>
        </CardContent>
      </Card>

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {usage.map((u) => (
          <Card key={u.label}>
            <CardContent className="p-5">
              <div className="mb-2 flex items-center justify-between text-sm">
                <span className="text-muted-foreground">{u.label}</span>
                <span className="font-medium tabular-nums">
                  {u.used} / {u.limit}
                </span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-muted">
                <div className="h-full rounded-full bg-primary" style={{ width: `${(u.used / u.limit) * 100}%` }} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {plans.map((plan) => (
          <Card key={plan.key} className={cn('flex flex-col', plan.current && 'border-primary ring-1 ring-primary')}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">{plan.name}</CardTitle>
                {plan.current ? <Badge>Current</Badge> : null}
              </div>
              <CardDescription>
                <span className="text-2xl font-semibold text-foreground">{plan.price}</span>
                {plan.period}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-1 flex-col">
              <ul className="flex-1 space-y-2 text-sm">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-center gap-2">
                    <Check className="size-4 text-success" aria-hidden /> {f}
                  </li>
                ))}
              </ul>
              <Button variant={plan.current ? 'outline' : 'primary'} className="mt-4 w-full" disabled={plan.current}>
                {plan.current ? 'Current plan' : `Choose ${plan.name}`}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
