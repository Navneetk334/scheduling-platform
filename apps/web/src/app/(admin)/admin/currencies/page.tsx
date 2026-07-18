'use client';

import { Ban } from 'lucide-react';
import * as React from 'react';

import { AdminTable, type AdminColumn } from '@/components/admin/admin-table';
import { PageHeader } from '@/components/dashboard/page-header';
import { StatusBadge } from '@/components/dashboard/status-badge';

interface Currency {
  code: string;
  name: string;
  symbol: string;
  rate: string;
  status: string;
}

const rows: Currency[] = [
  { code: 'USD', name: 'US Dollar', symbol: '$', rate: '1.00', status: 'ACTIVE' },
  { code: 'EUR', name: 'Euro', symbol: '€', rate: '0.92', status: 'ACTIVE' },
  { code: 'GBP', name: 'British Pound', symbol: '£', rate: '0.79', status: 'ACTIVE' },
  { code: 'INR', name: 'Indian Rupee', symbol: '₹', rate: '83.1', status: 'ACTIVE' },
  { code: 'JPY', name: 'Japanese Yen', symbol: '¥', rate: '157', status: 'INACTIVE' },
];

const columns: AdminColumn<Currency>[] = [
  { key: 'code', header: 'Code', render: (r) => <span className="font-medium">{r.code}</span> },
  { key: 'name', header: 'Name', render: (r) => r.name },
  { key: 'symbol', header: 'Symbol', render: (r) => r.symbol },
  { key: 'rate', header: 'Rate (USD)', render: (r) => <span className="tabular-nums text-muted-foreground">{r.rate}</span> },
  { key: 'status', header: 'Status', className: 'text-right', render: (r) => <StatusBadge status={r.status} /> },
];

export default function CurrenciesPage() {
  return (
    <div>
      <PageHeader title="Currencies" description="Supported billing currencies and exchange rates." />
      <AdminTable
        columns={columns}
        rows={rows}
        getRowKey={(r) => r.code}
        search={(r) => `${r.code} ${r.name}`}
        searchPlaceholder="Search currencies…"
        filters={[{ key: 'status', label: 'Status', get: (r) => r.status, options: [
          { label: 'Active', value: 'ACTIVE' },
          { label: 'Inactive', value: 'INACTIVE' },
        ] }]}
        bulkActions={[{ label: 'Disable', icon: <Ban className="size-4" />, destructive: true, onAction: () => undefined }]}
      />
    </div>
  );
}
