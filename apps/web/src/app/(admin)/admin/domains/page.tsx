'use client';

import { Ban } from 'lucide-react';
import * as React from 'react';

import { AdminTable, type AdminColumn } from '@/components/admin/admin-table';
import { PageHeader } from '@/components/dashboard/page-header';
import { StatusBadge } from '@/components/dashboard/status-badge';

interface Domain {
  id: string;
  domain: string;
  org: string;
  ssl: string;
  status: string;
}

const rows: Domain[] = [
  { id: '1', domain: 'book.initech.com', org: 'Initech', ssl: 'Issued', status: 'ACTIVE' },
  { id: '2', domain: 'meet.acme.com', org: 'Acme Inc', ssl: 'Issued', status: 'ACTIVE' },
  { id: '3', domain: 'schedule.globex.io', org: 'Globex', ssl: 'Pending', status: 'PENDING' },
  { id: '4', domain: 'cal.umbrella.co', org: 'Umbrella', ssl: 'Failed', status: 'FAILED' },
];

const columns: AdminColumn<Domain>[] = [
  { key: 'domain', header: 'Domain', render: (r) => <code className="text-xs font-medium">{r.domain}</code> },
  { key: 'org', header: 'Organization', render: (r) => <span className="text-muted-foreground">{r.org}</span> },
  { key: 'ssl', header: 'SSL', className: 'hidden md:table-cell', render: (r) => r.ssl },
  { key: 'status', header: 'Status', className: 'text-right', render: (r) => <StatusBadge status={r.status} /> },
];

export default function CustomDomainsPage() {
  return (
    <div>
      <PageHeader title="Custom Domains" description="Customer domains and TLS provisioning." />
      <AdminTable
        columns={columns}
        rows={rows}
        getRowKey={(r) => r.id}
        search={(r) => `${r.domain} ${r.org}`}
        searchPlaceholder="Search domains…"
        filters={[{ key: 'status', label: 'Status', get: (r) => r.status, options: [
          { label: 'Active', value: 'ACTIVE' },
          { label: 'Pending', value: 'PENDING' },
          { label: 'Failed', value: 'FAILED' },
        ] }]}
        bulkActions={[{ label: 'Revoke', icon: <Ban className="size-4" />, destructive: true, onAction: () => undefined }]}
      />
    </div>
  );
}
