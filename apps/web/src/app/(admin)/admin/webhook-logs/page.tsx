'use client';

import * as React from 'react';

import { AdminTable, type AdminColumn } from '@/components/admin/admin-table';
import { PageHeader } from '@/components/dashboard/page-header';
import { StatusBadge } from '@/components/dashboard/status-badge';

interface Log {
  id: string;
  event: string;
  org: string;
  endpoint: string;
  attempts: number;
  status: string;
  time: string;
}

const rows: Log[] = [
  { id: '1', event: 'booking.created', org: 'Acme Inc', endpoint: 'api.acme.io/hooks', attempts: 1, status: 'SUCCEEDED', time: '2m ago' },
  { id: '2', event: 'booking.cancelled', org: 'Globex', endpoint: 'hooks.globex.io', attempts: 3, status: 'FAILED', time: '8m ago' },
  { id: '3', event: 'booking.rescheduled', org: 'Initech', endpoint: 'zapier.com/12ab', attempts: 1, status: 'SUCCEEDED', time: '15m ago' },
];

const columns: AdminColumn<Log>[] = [
  { key: 'event', header: 'Event', render: (r) => <code className="rounded bg-muted px-1.5 py-0.5 text-xs">{r.event}</code> },
  { key: 'org', header: 'Org', render: (r) => <span className="text-muted-foreground">{r.org}</span> },
  { key: 'endpoint', header: 'Endpoint', className: 'hidden md:table-cell', render: (r) => <code className="text-xs">{r.endpoint}</code> },
  { key: 'attempts', header: 'Attempts', render: (r) => <span className="tabular-nums">{r.attempts}</span> },
  { key: 'time', header: 'When', render: (r) => <span className="text-muted-foreground">{r.time}</span> },
  { key: 'status', header: 'Status', className: 'text-right', render: (r) => <StatusBadge status={r.status} /> },
];

export default function WebhookLogsPage() {
  return (
    <div>
      <PageHeader title="Webhook Logs" description="Delivery attempts for all outbound webhooks." />
      <AdminTable
        columns={columns}
        rows={rows}
        getRowKey={(r) => r.id}
        search={(r) => `${r.event} ${r.org} ${r.endpoint}`}
        searchPlaceholder="Search webhook logs…"
        filters={[{ key: 'status', label: 'Status', get: (r) => r.status, options: [
          { label: 'Succeeded', value: 'SUCCEEDED' },
          { label: 'Failed', value: 'FAILED' },
        ] }]}
      />
    </div>
  );
}
