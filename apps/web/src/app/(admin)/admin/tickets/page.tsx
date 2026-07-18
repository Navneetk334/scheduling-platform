'use client';

import { Badge } from '@invincible/ui';
import { CheckCheck } from 'lucide-react';
import * as React from 'react';

import { AdminTable, type AdminColumn } from '@/components/admin/admin-table';
import { PageHeader } from '@/components/dashboard/page-header';
import { StatusBadge } from '@/components/dashboard/status-badge';

interface Ticket {
  id: string;
  subject: string;
  org: string;
  priority: string;
  status: string;
  updated: string;
}

const priorityVariant: Record<string, 'destructive' | 'warning' | 'secondary'> = {
  High: 'destructive',
  Medium: 'warning',
  Low: 'secondary',
};

const rows: Ticket[] = [
  { id: 'T-1042', subject: 'Cannot connect Google Calendar', org: 'Acme Inc', priority: 'High', status: 'OPEN', updated: '10m ago' },
  { id: 'T-1041', subject: 'Billing question about proration', org: 'Globex', priority: 'Low', status: 'PENDING', updated: '1h ago' },
  { id: 'T-1039', subject: 'Webhook signature mismatch', org: 'Initech', priority: 'Medium', status: 'OPEN', updated: '3h ago' },
  { id: 'T-1030', subject: 'Feature request: iCal export', org: 'Umbrella', priority: 'Low', status: 'CLOSED', updated: 'Yesterday' },
];

const columns: AdminColumn<Ticket>[] = [
  { key: 'id', header: 'Ticket', render: (r) => <code className="text-xs font-medium">{r.id}</code> },
  { key: 'subject', header: 'Subject', render: (r) => r.subject },
  { key: 'org', header: 'Org', className: 'hidden md:table-cell', render: (r) => <span className="text-muted-foreground">{r.org}</span> },
  { key: 'priority', header: 'Priority', render: (r) => <Badge variant={priorityVariant[r.priority] ?? 'secondary'}>{r.priority}</Badge> },
  { key: 'status', header: 'Status', className: 'text-right', render: (r) => <StatusBadge status={r.status} /> },
];

export default function TicketsPage() {
  return (
    <div>
      <PageHeader title="Support Tickets" description="Customer support requests across all tenants." />
      <AdminTable
        columns={columns}
        rows={rows}
        getRowKey={(r) => r.id}
        search={(r) => `${r.id} ${r.subject} ${r.org}`}
        searchPlaceholder="Search tickets…"
        filters={[
          { key: 'status', label: 'Status', get: (r) => r.status, options: [
            { label: 'Open', value: 'OPEN' },
            { label: 'Pending', value: 'PENDING' },
            { label: 'Closed', value: 'CLOSED' },
          ] },
          { key: 'priority', label: 'Priority', get: (r) => r.priority, options: [
            { label: 'High', value: 'High' },
            { label: 'Medium', value: 'Medium' },
            { label: 'Low', value: 'Low' },
          ] },
        ]}
        bulkActions={[{ label: 'Close', icon: <CheckCheck className="size-4" />, onAction: () => undefined }]}
      />
    </div>
  );
}
