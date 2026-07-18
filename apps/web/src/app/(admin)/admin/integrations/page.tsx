'use client';

import { Badge, Button, Card, CardContent, Switch } from '@invincible/ui';
import { CreditCard, HardDrive, Mail, MessageSquare, Video, type LucideIcon } from 'lucide-react';
import * as React from 'react';

import { FadeItem, Stagger } from '@/components/dashboard/motion';
import { PageHeader } from '@/components/dashboard/page-header';

interface Integration {
  id: string;
  name: string;
  description: string;
  icon: LucideIcon;
  connected: boolean;
}

const integrations: Integration[] = [
  { id: 'stripe', name: 'Stripe', description: 'Payments, subscriptions, invoices.', icon: CreditCard, connected: true },
  { id: 'resend', name: 'Resend', description: 'Transactional email delivery.', icon: Mail, connected: true },
  { id: 'twilio', name: 'Twilio', description: 'SMS and WhatsApp messaging.', icon: MessageSquare, connected: true },
  { id: 's3', name: 'S3 Storage', description: 'Object storage for assets & backups.', icon: HardDrive, connected: true },
  { id: 'zoom', name: 'Zoom', description: 'Video meeting link generation.', icon: Video, connected: false },
];

export default function AdminIntegrationsPage() {
  return (
    <div>
      <PageHeader title="Integrations" description="Platform-level provider connections." />
      <Stagger className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {integrations.map((it) => (
          <FadeItem key={it.id}>
            <Card className="h-full">
              <CardContent className="flex h-full flex-col p-5">
                <div className="flex items-start justify-between">
                  <div className="flex size-11 items-center justify-center rounded-lg bg-secondary text-foreground">
                    <it.icon className="size-5" aria-hidden />
                  </div>
                  <Switch defaultChecked={it.connected} aria-label={`Toggle ${it.name}`} />
                </div>
                <div className="mt-3 flex items-center gap-2">
                  <h3 className="font-semibold">{it.name}</h3>
                  {it.connected ? <Badge variant="success">Connected</Badge> : null}
                </div>
                <p className="mt-1 flex-1 text-sm text-muted-foreground">{it.description}</p>
                <Button variant="outline" size="sm" className="mt-4 w-full">Configure</Button>
              </CardContent>
            </Card>
          </FadeItem>
        ))}
      </Stagger>
    </div>
  );
}
