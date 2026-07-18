'use client';

import * as React from 'react';

import { AdminTable, type AdminColumn } from '@/components/admin/admin-table';
import { PageHeader } from '@/components/dashboard/page-header';
import { StatusBadge } from '@/components/dashboard/status-badge';

interface Refund {
  id: string;
  org: string;
  amount: string;
  reason: string;
  status: string;
  date: string;
}

const rows: Refund[] = [
  { id: 're_1', org: 'Hooli', amount: '$150.00', reason: 'Duplicate charge', status: 'SUCCEEDED', date: 'Jul 08' },
  { id: 're_2', org: 'Umbrella', amount: '$49.00', reason: 'Requested by customer', status: 'PENDING', date: 'Jul 07' },
  { id: 're_3', org: 'Globex', amount: '$15.00', reason: 'Downgrade proration', status: 'SUCCEEDED', date: 'Jul 05' },
];

const columns: AdminColumn<Refund>[] = [
  { key: 'id', header: 'Refund', render: (r) => <code className="text-xs">{r.id}</code> },
  { key: 'org', header: 'Organization', render: (r) => <span className="font-medium">{r.org}</span> },
  { key: 'reason', header: 'Reason', className: 'hidden md:table-cell', render: (r) => <span className="text-muted-foreground">{r.reason}</span> },
  { key: 'amount', header: 'Amount', render: (r) => <span className="font-medium tabular-nums">{r.amount}</span> },
  { key: 'status', header: 'Status', className: 'text-right', render: (r) => <StatusBadge status={r.status} /> },
];

export default function RefundsPage() {
  return (
    <div>
      <PageHeader title="Refunds" description="Issued and pending refunds." />
      <AdminTable
        columns={columns}
        rows={rows}
        getRowKey={(r) => r.id}
        search={(r) => `${r.org} ${r.id} ${r.reason}`}
        searchPlaceholder="Search refunds…"
        filters={[{ key: 'status', label: 'Status', get: (r) => r.status, options: [
          { label: 'Succeeded', value: 'SUCCEEDED' },
          { label: 'Pending', value: 'PENDING' },
        ] }]}
      />
    </div>
  );
}
