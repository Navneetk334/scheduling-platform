'use client';

import { Button } from '@invincible/ui';
import { Download } from 'lucide-react';
import * as React from 'react';

import { DataTable, type Column } from '@/components/dashboard/data-table';
import { PageHeader } from '@/components/dashboard/page-header';
import { StatusBadge } from '@/components/dashboard/status-badge';

interface Invoice {
  id: string;
  number: string;
  customer: string;
  total: string;
  status: string;
  due: string;
}

const invoices: Invoice[] = [
  { id: '1', number: 'INV-2026-0042', customer: 'Enigma Ltd', total: '$1,250.00', status: 'PAID', due: 'Jul 15' },
  { id: '2', number: 'INV-2026-0041', customer: 'Analytical Co', total: '$450.00', status: 'OPEN', due: 'Jul 28' },
  { id: '3', number: 'INV-2026-0040', customer: 'Apollo Systems', total: '$3,000.00', status: 'PAID', due: 'Jul 10' },
  { id: '4', number: 'INV-2026-0039', customer: 'Navy Research', total: '$800.00', status: 'VOID', due: 'Jul 02' },
];

const columns: Column<Invoice>[] = [
  { key: 'number', header: 'Invoice', render: (r) => <code className="text-xs font-medium">{r.number}</code> },
  { key: 'customer', header: 'Customer', render: (r) => <span className="font-medium">{r.customer}</span> },
  { key: 'due', header: 'Due', className: 'hidden md:table-cell', render: (r) => <span className="text-muted-foreground">{r.due}</span> },
  { key: 'total', header: 'Total', render: (r) => <span className="font-medium tabular-nums">{r.total}</span> },
  { key: 'status', header: 'Status', render: (r) => <StatusBadge status={r.status} /> },
  {
    key: 'actions',
    header: '',
    className: 'text-right',
    render: () => (
      <Button variant="ghost" size="sm" aria-label="Download invoice">
        <Download className="size-4" />
      </Button>
    ),
  },
];

export default function InvoicesPage() {
  return (
    <div>
      <PageHeader title="Invoices" description="Billing documents issued to your customers." />
      <DataTable columns={columns} rows={invoices} getRowKey={(r) => r.id} />
    </div>
  );
}
