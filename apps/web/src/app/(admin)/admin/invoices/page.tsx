'use client';

import { Download } from 'lucide-react';
import * as React from 'react';

import { AdminTable, type AdminColumn } from '@/components/admin/admin-table';
import { PageHeader } from '@/components/dashboard/page-header';
import { StatusBadge } from '@/components/dashboard/status-badge';

interface Invoice {
  id: string;
  number: string;
  org: string;
  total: string;
  status: string;
  due: string;
}

const rows: Invoice[] = [
  { id: '1', number: 'INV-2026-1042', org: 'Initech', total: '$2,400.00', status: 'PAID', due: 'Jul 10' },
  { id: '2', number: 'INV-2026-1041', org: 'Acme Inc', total: '$490.00', status: 'OPEN', due: 'Jul 28' },
  { id: '3', number: 'INV-2026-1040', org: 'Globex', total: '$150.00', status: 'PAID', due: 'Jul 03' },
  { id: '4', number: 'INV-2026-1039', org: 'Hooli', total: '$150.00', status: 'VOID', due: '—' },
];

const columns: AdminColumn<Invoice>[] = [
  { key: 'number', header: 'Invoice', render: (r) => <code className="text-xs font-medium">{r.number}</code> },
  { key: 'org', header: 'Organization', render: (r) => <span className="font-medium">{r.org}</span> },
  { key: 'due', header: 'Due', className: 'hidden md:table-cell', render: (r) => <span className="text-muted-foreground">{r.due}</span> },
  { key: 'total', header: 'Total', render: (r) => <span className="font-medium tabular-nums">{r.total}</span> },
  { key: 'status', header: 'Status', render: (r) => <StatusBadge status={r.status} /> },
];

export default function AdminInvoicesPage() {
  return (
    <div>
      <PageHeader title="Invoices" description="Billing documents issued platform-wide." />
      <AdminTable
        columns={columns}
        rows={rows}
        getRowKey={(r) => r.id}
        search={(r) => `${r.number} ${r.org}`}
        searchPlaceholder="Search invoices…"
        filters={[{ key: 'status', label: 'Status', get: (r) => r.status, options: [
          { label: 'Paid', value: 'PAID' },
          { label: 'Open', value: 'OPEN' },
          { label: 'Void', value: 'VOID' },
        ] }]}
        bulkActions={[{ label: 'Download', icon: <Download className="size-4" />, onAction: () => undefined }]}
      />
    </div>
  );
}
