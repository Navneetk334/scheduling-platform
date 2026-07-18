'use client';

import { Badge, Button, Card, CardContent, CardHeader, CardTitle } from '@invincible/ui';
import { Check, Plus } from 'lucide-react';
import * as React from 'react';

import { FadeItem, Stagger } from '@/components/dashboard/motion';
import { PageHeader } from '@/components/dashboard/page-header';

const plans = [
  { key: 'free', name: 'Free', price: '$0', active: true, subs: 8420, features: ['1 user', 'Core scheduling'] },
  { key: 'pro', name: 'Pro', price: '$15/mo', active: true, subs: 3120, features: ['Payments', 'Unlimited types', 'SMS'] },
  { key: 'team', name: 'Team', price: '$49/mo', active: true, subs: 890, features: ['Teams', 'Round robin', 'Analytics'] },
  { key: 'enterprise', name: 'Enterprise', price: 'Custom', active: true, subs: 64, features: ['SSO', 'Audit logs', 'SLA'] },
];

export default function PlansPage() {
  return (
    <div>
      <PageHeader
        title="Plans"
        description="Subscription plans offered on the platform."
        actions={<Button size="sm"><Plus className="size-4" /> New plan</Button>}
      />
      <Stagger className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {plans.map((p) => (
          <FadeItem key={p.key}>
            <Card className="h-full">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">{p.name}</CardTitle>
                  <Badge variant={p.active ? 'success' : 'secondary'}>{p.active ? 'Live' : 'Draft'}</Badge>
                </div>
                <p className="text-2xl font-semibold">{p.price}</p>
              </CardHeader>
              <CardContent>
                <p className="mb-3 text-sm text-muted-foreground">{p.subs.toLocaleString()} subscribers</p>
                <ul className="space-y-1.5 text-sm">
                  {p.features.map((f) => (
                    <li key={f} className="flex items-center gap-2">
                      <Check className="size-4 text-success" aria-hidden /> {f}
                    </li>
                  ))}
                </ul>
                <Button variant="outline" size="sm" className="mt-4 w-full">Edit plan</Button>
              </CardContent>
            </Card>
          </FadeItem>
        ))}
      </Stagger>
    </div>
  );
}
