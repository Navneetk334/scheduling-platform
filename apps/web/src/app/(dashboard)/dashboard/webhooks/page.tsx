'use client';

import { Badge, Button } from '@invincible/ui';
import { Plus } from 'lucide-react';
import * as React from 'react';

import { DataTable, type Column } from '@/components/dashboard/data-table';
import { PageHeader } from '@/components/dashboard/page-header';
import { StatusBadge } from '@/components/dashboard/status-badge';

interface Endpoint {
  id: string;
  url: string;
  events: string[];
  status: string;
  success: string;
}

const endpoints: Endpoint[] = [
  { id: '1', url: 'https://api.acme.io/hooks/scheduling', events: ['booking.created', 'booking.cancelled'], status: 'ACTIVE', success: '99.8%' },
  { id: '2', url: 'https://hooks.zapier.com/12ab34', events: ['booking.created'], status: 'ACTIVE', success: '100%' },
  { id: '3', url: 'https://staging.acme.io/hooks', events: ['booking.rescheduled'], status: 'PAUSED', success: '92.1%' },
];

const columns: Column<Endpoint>[] = [
  { key: 'url', header: 'Endpoint', render: (r) => <code className="text-xs">{r.url}</code> },
  {
    key: 'events',
    header: 'Events',
    className: 'hidden md:table-cell',
    render: (r) => (
      <div className="flex flex-wrap gap-1">
        {r.events.map((e) => (
          <Badge key={e} variant="secondary" className="font-normal">
            {e}
          </Badge>
        ))}
      </div>
    ),
  },
  { key: 'success', header: 'Success', render: (r) => <span className="tabular-nums text-muted-foreground">{r.success}</span> },
  { key: 'status', header: 'Status', className: 'text-right', render: (r) => <StatusBadge status={r.status} /> },
];

export default function WebhooksPage() {
  return (
    <div>
      <PageHeader
        title="Webhooks"
        description="Receive signed, real-time events at your endpoints."
        actions={
          <Button size="sm">
            <Plus className="size-4" /> Add endpoint
          </Button>
        }
      />
      <DataTable columns={columns} rows={endpoints} getRowKey={(r) => r.id} />
    </div>
  );
}
