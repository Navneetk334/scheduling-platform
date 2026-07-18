'use client';

import { Badge } from '@invincible/ui';
import * as React from 'react';

import { AdminTable, type AdminColumn } from '@/components/admin/admin-table';
import { PageHeader } from '@/components/dashboard/page-header';
import { StatusBadge } from '@/components/dashboard/status-badge';

interface Log {
  id: string;
  channel: string;
  to: string;
  type: string;
  status: string;
  time: string;
}

const rows: Log[] = [
  { id: '1', channel: 'SMS', to: '+1 555 0100', type: 'reminder', status: 'DELIVERED', time: '3m ago' },
  { id: '2', channel: 'WHATSAPP', to: '+44 7700 900', type: 'reminder', status: 'DELIVERED', time: '12m ago' },
  { id: '3', channel: 'EMAIL', to: 'ada@analytical.co', type: 'confirmation', status: 'DELIVERED', time: '30m ago' },
  { id: '4', channel: 'SMS', to: '+1 555 0199', type: 'reminder', status: 'FAILED', time: '1h ago' },
];

const columns: AdminColumn<Log>[] = [
  { key: 'channel', header: 'Channel', render: (r) => <Badge variant="secondary">{r.channel}</Badge> },
  { key: 'to', header: 'Recipient', render: (r) => <span className="font-medium">{r.to}</span> },
  { key: 'type', header: 'Type', render: (r) => <code className="text-xs">{r.type}</code> },
  { key: 'time', header: 'When', render: (r) => <span className="text-muted-foreground">{r.time}</span> },
  { key: 'status', header: 'Status', className: 'text-right', render: (r) => <StatusBadge status={r.status} /> },
];

export default function NotificationLogsPage() {
  return (
    <div>
      <PageHeader title="Notification Logs" description="Email, SMS, and WhatsApp delivery across channels." />
      <AdminTable
        columns={columns}
        rows={rows}
        getRowKey={(r) => r.id}
        search={(r) => `${r.channel} ${r.to} ${r.type}`}
        searchPlaceholder="Search notifications…"
        filters={[
          { key: 'channel', label: 'Channel', get: (r) => r.channel, options: [
            { label: 'Email', value: 'EMAIL' },
            { label: 'SMS', value: 'SMS' },
            { label: 'WhatsApp', value: 'WHATSAPP' },
          ] },
          { key: 'status', label: 'Status', get: (r) => r.status, options: [
            { label: 'Delivered', value: 'DELIVERED' },
            { label: 'Failed', value: 'FAILED' },
          ] },
        ]}
      />
    </div>
  );
}
