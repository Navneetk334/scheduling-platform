'use client';

import { Avatar, AvatarFallback } from '@invincible/ui';
import * as React from 'react';

import { DataTable, type Column } from '@/components/dashboard/data-table';
import { PageHeader } from '@/components/dashboard/page-header';

interface LogEntry {
  id: string;
  actor: string;
  action: string;
  entity: string;
  ip: string;
  at: string;
}

const logs: LogEntry[] = [
  { id: '1', actor: 'Demo Founder', action: 'meetingtype.created', entity: 'Intro Call', ip: '203.0.113.4', at: '2m ago' },
  { id: '2', actor: 'Demo Founder', action: 'booking.cancelled', entity: 'INV-9F2A', ip: '203.0.113.4', at: '1h ago' },
  { id: '3', actor: 'System', action: 'webhook.delivered', entity: 'booking.created', ip: '—', at: '3h ago' },
  { id: '4', actor: 'Grace Hopper', action: 'member.invited', entity: 'katherine@acme.io', ip: '198.51.100.9', at: 'Yesterday' },
  { id: '5', actor: 'Demo Founder', action: 'availability.updated', entity: 'Working Hours', ip: '203.0.113.4', at: 'Yesterday' },
];

const columns: Column<LogEntry>[] = [
  {
    key: 'actor',
    header: 'Actor',
    render: (r) => (
      <div className="flex items-center gap-2.5">
        <Avatar className="size-7">
          <AvatarFallback className="text-[10px]">
            {r.actor.split(' ').map((p) => p[0]).join('').slice(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <span className="font-medium">{r.actor}</span>
      </div>
    ),
  },
  { key: 'action', header: 'Action', render: (r) => <code className="rounded bg-muted px-1.5 py-0.5 text-xs">{r.action}</code> },
  { key: 'entity', header: 'Entity', render: (r) => <span className="text-muted-foreground">{r.entity}</span> },
  { key: 'ip', header: 'IP', className: 'hidden md:table-cell', render: (r) => <span className="text-muted-foreground">{r.ip}</span> },
  { key: 'at', header: 'When', className: 'text-right', render: (r) => <span className="text-muted-foreground">{r.at}</span> },
];

export default function ActivityLogsPage() {
  return (
    <div>
      <PageHeader title="Activity Logs" description="An immutable record of actions across your organization." />
      <DataTable columns={columns} rows={logs} getRowKey={(r) => r.id} />
    </div>
  );
}
