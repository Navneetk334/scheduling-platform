'use client';

import { Badge, Card, CardContent, CardHeader, CardTitle } from '@invincible/ui';
import * as React from 'react';

import { FadeItem, Stagger } from '@/components/dashboard/motion';
import { PageHeader } from '@/components/dashboard/page-header';

const queues = [
  { name: 'webhooks', waiting: 12, active: 3, completed: 48210, failed: 4 },
  { name: 'notifications', waiting: 41, active: 8, completed: 129044, failed: 12 },
  { name: 'calendar-sync', waiting: 6, active: 2, completed: 9821, failed: 1 },
];

export default function QueuesPage() {
  return (
    <div>
      <PageHeader title="Queue Monitoring" description="Live BullMQ queue depths and throughput." />
      <Stagger className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {queues.map((q) => (
          <FadeItem key={q.name}>
            <Card>
              <CardHeader className="flex-row items-center justify-between space-y-0">
                <CardTitle className="text-base">{q.name}</CardTitle>
                <Badge variant={q.failed > 10 ? 'warning' : 'success'}>{q.failed} failed</Badge>
              </CardHeader>
              <CardContent className="grid grid-cols-3 gap-3 text-center">
                <div>
                  <p className="text-2xl font-semibold tabular-nums">{q.waiting}</p>
                  <p className="text-xs text-muted-foreground">Waiting</p>
                </div>
                <div>
                  <p className="text-2xl font-semibold tabular-nums text-primary">{q.active}</p>
                  <p className="text-xs text-muted-foreground">Active</p>
                </div>
                <div>
                  <p className="text-2xl font-semibold tabular-nums">{(q.completed / 1000).toFixed(1)}k</p>
                  <p className="text-xs text-muted-foreground">Completed</p>
                </div>
              </CardContent>
            </Card>
          </FadeItem>
        ))}
      </Stagger>
    </div>
  );
}
