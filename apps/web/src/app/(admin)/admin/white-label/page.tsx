'use client';

import * as React from 'react';

import { AdminTable, type AdminColumn } from '@/components/admin/admin-table';
import { PageHeader } from '@/components/dashboard/page-header';
import { StatusBadge } from '@/components/dashboard/status-badge';

interface WhiteLabel {
  id: string;
  org: string;
  brand: string;
  color: string;
  plan: string;
  status: string;
}

const rows: WhiteLabel[] = [
  { id: '1', org: 'Initech', brand: 'Initech Scheduling', color: '#4F46E5', plan: 'Enterprise', status: 'ACTIVE' },
  { id: '2', org: 'Acme Inc', brand: 'Acme Booking', color: '#0EA5E9', plan: 'Team', status: 'ACTIVE' },
  { id: '3', org: 'Umbrella', brand: 'Umbrella Meet', color: '#10B981', plan: 'Enterprise', status: 'INACTIVE' },
];

const columns: AdminColumn<WhiteLabel>[] = [
  { key: 'org', header: 'Organization', render: (r) => <span className="font-medium">{r.org}</span> },
  { key: 'brand', header: 'Brand', render: (r) => (
    <span className="inline-flex items-center gap-2">
      <span className="size-3 rounded-full" style={{ backgroundColor: r.color }} aria-hidden /> {r.brand}
    </span>
  ) },
  { key: 'plan', header: 'Plan', className: 'hidden md:table-cell', render: (r) => r.plan },
  { key: 'status', header: 'Status', className: 'text-right', render: (r) => <StatusBadge status={r.status} /> },
];

export default function WhiteLabelPage() {
  return (
    <div>
      <PageHeader title="White Label Customers" description="Organizations with custom branding enabled." />
      <AdminTable
        columns={columns}
        rows={rows}
        getRowKey={(r) => r.id}
        search={(r) => `${r.org} ${r.brand}`}
        searchPlaceholder="Search white-label customers…"
        filters={[{ key: 'status', label: 'Status', get: (r) => r.status, options: [
          { label: 'Active', value: 'ACTIVE' },
          { label: 'Inactive', value: 'INACTIVE' },
        ] }]}
      />
    </div>
  );
}
