'use client';

import { Ban } from 'lucide-react';
import * as React from 'react';

import { AdminTable, type AdminColumn } from '@/components/admin/admin-table';
import { PageHeader } from '@/components/dashboard/page-header';
import { StatusBadge } from '@/components/dashboard/status-badge';

interface Language {
  code: string;
  name: string;
  native: string;
  coverage: string;
  status: string;
}

const rows: Language[] = [
  { code: 'en', name: 'English', native: 'English', coverage: '100%', status: 'ACTIVE' },
  { code: 'es', name: 'Spanish', native: 'Español', coverage: '96%', status: 'ACTIVE' },
  { code: 'fr', name: 'French', native: 'Français', coverage: '92%', status: 'ACTIVE' },
  { code: 'de', name: 'German', native: 'Deutsch', coverage: '88%', status: 'ACTIVE' },
  { code: 'ar', name: 'Arabic (RTL)', native: 'العربية', coverage: '61%', status: 'INACTIVE' },
];

const columns: AdminColumn<Language>[] = [
  { key: 'code', header: 'Code', render: (r) => <span className="font-medium">{r.code}</span> },
  { key: 'name', header: 'Language', render: (r) => r.name },
  { key: 'native', header: 'Native', render: (r) => <span className="text-muted-foreground">{r.native}</span> },
  { key: 'coverage', header: 'Coverage', render: (r) => <span className="tabular-nums">{r.coverage}</span> },
  { key: 'status', header: 'Status', className: 'text-right', render: (r) => <StatusBadge status={r.status} /> },
];

export default function LanguagesPage() {
  return (
    <div>
      <PageHeader title="Languages" description="Localization languages and translation coverage." />
      <AdminTable
        columns={columns}
        rows={rows}
        getRowKey={(r) => r.code}
        search={(r) => `${r.code} ${r.name} ${r.native}`}
        searchPlaceholder="Search languages…"
        filters={[{ key: 'status', label: 'Status', get: (r) => r.status, options: [
          { label: 'Active', value: 'ACTIVE' },
          { label: 'Inactive', value: 'INACTIVE' },
        ] }]}
        bulkActions={[{ label: 'Disable', icon: <Ban className="size-4" />, destructive: true, onAction: () => undefined }]}
      />
    </div>
  );
}
