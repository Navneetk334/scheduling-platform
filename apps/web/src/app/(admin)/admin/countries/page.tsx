'use client';

import { Ban } from 'lucide-react';
import * as React from 'react';

import { AdminTable, type AdminColumn } from '@/components/admin/admin-table';
import { PageHeader } from '@/components/dashboard/page-header';
import { StatusBadge } from '@/components/dashboard/status-badge';

interface Country {
  code: string;
  name: string;
  region: string;
  status: string;
}

const rows: Country[] = [
  { code: 'US', name: 'United States', region: 'Americas', status: 'ACTIVE' },
  { code: 'GB', name: 'United Kingdom', region: 'Europe', status: 'ACTIVE' },
  { code: 'DE', name: 'Germany', region: 'Europe', status: 'ACTIVE' },
  { code: 'IN', name: 'India', region: 'Asia', status: 'ACTIVE' },
  { code: 'BR', name: 'Brazil', region: 'Americas', status: 'INACTIVE' },
];

const columns: AdminColumn<Country>[] = [
  { key: 'code', header: 'Code', render: (r) => <span className="font-medium">{r.code}</span> },
  { key: 'name', header: 'Country', render: (r) => r.name },
  { key: 'region', header: 'Region', render: (r) => <span className="text-muted-foreground">{r.region}</span> },
  { key: 'status', header: 'Status', className: 'text-right', render: (r) => <StatusBadge status={r.status} /> },
];

export default function CountriesPage() {
  return (
    <div>
      <PageHeader title="Countries" description="Countries available for billing and localization." />
      <AdminTable
        columns={columns}
        rows={rows}
        getRowKey={(r) => r.code}
        search={(r) => `${r.code} ${r.name} ${r.region}`}
        searchPlaceholder="Search countries…"
        filters={[{ key: 'region', label: 'Region', get: (r) => r.region, options: [
          { label: 'Americas', value: 'Americas' },
          { label: 'Europe', value: 'Europe' },
          { label: 'Asia', value: 'Asia' },
        ] }]}
        bulkActions={[{ label: 'Disable', icon: <Ban className="size-4" />, destructive: true, onAction: () => undefined }]}
      />
    </div>
  );
}
