'use client';

import * as React from 'react';

import { AdminTable, type AdminColumn } from '@/components/admin/admin-table';
import { PageHeader } from '@/components/dashboard/page-header';
import { StatusBadge } from '@/components/dashboard/status-badge';

interface Payment {
  id: string;
  org: string;
  amount: string;
  method: string;
  status: string;
  date: string;
}

const rows: Payment[] = [
  { id: 'py_1', org: 'Acme Inc', amount: '$490.00', method: 'Visa ·· 4242', status: 'SUCCEEDED', date: 'Jul 12' },
  { id: 'py_2', org: 'Globex', amount: '$150.00', method: 'Mastercard ·· 5100', status: 'SUCCEEDED', date: 'Jul 11' },
  { id: 'py_3', org: 'Initech', amount: '$2,400.00', method: 'ACH', status: 'SUCCEEDED', date: 'Jul 10' },
  { id: 'py_4', org: 'Hooli', amount: '$150.00', method: 'Amex ·· 0005', status: 'FAILED', date: 'Jul 09' },
];

const columns: AdminColumn<Payment>[] = [
  { key: 'id', header: 'Payment', render: (r) => <code className="text-xs">{r.id}</code> },
  { key: 'org', header: 'Organization', render: (r) => <span className="font-medium">{r.org}</span> },
  { key: 'method', header: 'Method', className: 'hidden md:table-cell', render: (r) => <span className="text-muted-foreground">{r.method}</span> },
  { key: 'date', header: 'Date', render: (r) => <span className="text-muted-foreground">{r.date}</span> },
  { key: 'amount', header: 'Amount', render: (r) => <span className="font-medium tabular-nums">{r.amount}</span> },
  { key: 'status', header: 'Status', className: 'text-right', render: (r) => <StatusBadge status={r.status} /> },
];

export default function AdminPaymentsPage() {
  return (
    <div>
      <PageHeader title="Payments" description="All payments processed across the platform." />
      <AdminTable
        columns={columns}
        rows={rows}
        getRowKey={(r) => r.id}
        search={(r) => `${r.org} ${r.id} ${r.method}`}
        searchPlaceholder="Search payments…"
        filters={[
          { key: 'status', label: 'Status', get: (r) => r.status, options: [
            { label: 'Succeeded', value: 'SUCCEEDED' },
            { label: 'Failed', value: 'FAILED' },
          ] },
        ]}
      />
    </div>
  );
}
