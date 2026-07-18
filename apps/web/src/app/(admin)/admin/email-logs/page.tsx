'use client';

import * as React from 'react';

import { AdminTable, type AdminColumn } from '@/components/admin/admin-table';
import { PageHeader } from '@/components/dashboard/page-header';
import { StatusBadge } from '@/components/dashboard/status-badge';

interface Log {
  id: string;
  to: string;
  subject: string;
  template: string;
  status: string;
  time: string;
}

const rows: Log[] = [
  { id: '1', to: 'ada@analytical.co', subject: 'Your booking is confirmed', template: 'booking_confirmation', status: 'DELIVERED', time: '1m ago' },
  { id: '2', to: 'alan@enigma.io', subject: 'Reminder: meeting in 1 hour', template: 'reminder', status: 'DELIVERED', time: '20m ago' },
  { id: '3', to: 'bounce@invalid.dev', subject: 'Your booking is confirmed', template: 'booking_confirmation', status: 'BOUNCED', time: '1h ago' },
  { id: '4', to: 'grace@navy.mil', subject: 'Password reset', template: 'password_reset', status: 'SENT', time: '2h ago' },
];

const columns: AdminColumn<Log>[] = [
  { key: 'to', header: 'Recipient', render: (r) => <span className="font-medium">{r.to}</span> },
  { key: 'subject', header: 'Subject', className: 'hidden md:table-cell', render: (r) => <span className="text-muted-foreground">{r.subject}</span> },
  { key: 'template', header: 'Template', render: (r) => <code className="text-xs">{r.template}</code> },
  { key: 'time', header: 'When', render: (r) => <span className="text-muted-foreground">{r.time}</span> },
  { key: 'status', header: 'Status', className: 'text-right', render: (r) => <StatusBadge status={r.status} /> },
];

export default function EmailLogsPage() {
  return (
    <div>
      <PageHeader title="Email Logs" description="Delivery status for transactional email." />
      <AdminTable
        columns={columns}
        rows={rows}
        getRowKey={(r) => r.id}
        search={(r) => `${r.to} ${r.subject} ${r.template}`}
        searchPlaceholder="Search email logs…"
        filters={[{ key: 'status', label: 'Status', get: (r) => r.status, options: [
          { label: 'Delivered', value: 'DELIVERED' },
          { label: 'Sent', value: 'SENT' },
          { label: 'Bounced', value: 'BOUNCED' },
        ] }]}
      />
    </div>
  );
}
