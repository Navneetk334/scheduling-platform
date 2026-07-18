'use client';

import { Badge, Button, Card, CardContent, Switch } from '@invincible/ui';
import {
  CalendarDays,
  MessageSquare,
  Video,
  Webhook,
  Zap,
  type LucideIcon,
} from 'lucide-react';
import * as React from 'react';

import { FadeItem, Stagger } from '@/components/dashboard/motion';
import { PageHeader } from '@/components/dashboard/page-header';

interface Integration {
  id: string;
  name: string;
  description: string;
  icon: LucideIcon;
  connected: boolean;
  category: string;
}

const integrations: Integration[] = [
  { id: 'google', name: 'Google Calendar', description: 'Two-way sync and Meet links.', icon: CalendarDays, connected: true, category: 'Calendar' },
  { id: 'zoom', name: 'Zoom', description: 'Auto-generate Zoom meeting links.', icon: Video, connected: true, category: 'Video' },
  { id: 'teams', name: 'Microsoft Teams', description: 'Calendar sync and Teams links.', icon: Video, connected: false, category: 'Video' },
  { id: 'slack', name: 'Slack', description: 'Booking notifications to channels.', icon: MessageSquare, connected: false, category: 'Messaging' },
  { id: 'zapier', name: 'Zapier', description: 'Connect to 6,000+ apps.', icon: Zap, connected: false, category: 'Automation' },
  { id: 'webhooks', name: 'Webhooks', description: 'Send signed events to your endpoints.', icon: Webhook, connected: true, category: 'Developer' },
];

export default function IntegrationsPage() {
  return (
    <div>
      <PageHeader title="Integrations" description="Connect INVINCIBLE PROS to the tools your team uses." />

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
                <div className="mt-4 flex items-center justify-between">
                  <Badge variant="outline">{it.category}</Badge>
                  <Button variant={it.connected ? 'outline' : 'primary'} size="sm">
                    {it.connected ? 'Configure' : 'Connect'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </FadeItem>
        ))}
      </Stagger>
    </div>
  );
}
