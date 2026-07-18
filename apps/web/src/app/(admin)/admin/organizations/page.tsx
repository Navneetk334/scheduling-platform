'use client';

import { Ban } from 'lucide-react';
import * as React from 'react';

import { AdminTable, type AdminColumn } from '@/components/admin/admin-table';
import { PageHeader } from '@/components/dashboard/page-header';
import { StatusBadge } from '@/components/dashboard/status-badge';

interface Org {
  id: string;
  name: string;
  slug: string;
  plan: string;
  members: number;
  mrr: string;
  status: string;
}

const orgs: Org[] = [
  { id: '1', name: 'Acme Inc', slug: 'acme', plan: 'Team', members: 12, mrr: '$490', status: 'ACTIVE' },
  { id: '2', name: 'Globex', slug: 'globex', plan: 'Pro', members: 4, mrr: '$150', status: 'ACTIVE' },
  { id: '3', name: 'Initech', slug: 'initech', plan: 'Enterprise', members: 88, mrr: '$2,400', status: 'ACTIVE' },
  { id: '4', name: 'Umbrella', slug: 'umbrella', plan: 'Free', members: 2, mrr: '$0', status: 'INACTIVE' },
];

const columns: AdminColumn<Org>[] = [
  { key: 'name', header: 'Organization', render: (r) => (
    <div>
      <p className="font-medium">{r.name}</p>
      <p className="text-xs text-muted-foreground">/{r.slug}</p>
    </div>
  ) },
  { key: 'plan', header: 'Plan', render: (r) => r.plan },
  { key: 'members', header: 'Members', render: (r) => <span className="tabular-nums">{r.members}</span> },
  { key: 'mrr', header: 'MRR', render: (r) => <span className="font-medium tabular-nums">{r.mrr}</span> },
  { key: 'status', header: 'Status', className: 'text-right', render: (r) => <StatusBadge status={r.status} /> },
];

export default function AdminOrganizationsPage() {
  return (
    <div>
      <PageHeader title="Organizations" description="All tenant organizations on the platform." />
      <AdminTable
        columns={columns}
        rows={orgs}
        getRowKey={(r) => r.id}
        search={(r) => `${r.name} ${r.slug} ${r.plan}`}
        searchPlaceholder="Search organizations…"
        filters={[
          { key: 'plan', label: 'Plan', get: (r) => r.plan, options: [
            { label: 'Free', value: 'Free' },
            { label: 'Pro', value: 'Pro' },
            { label: 'Team', value: 'Team' },
            { label: 'Enterprise', value: 'Enterprise' },
          ] },
          { key: 'status', label: 'Status', get: (r) => r.status, options: [
            { label: 'Active', value: 'ACTIVE' },
            { label: 'Inactive', value: 'INACTIVE' },
          ] },
        ]}
        bulkActions={[{ label: 'Suspend', icon: <Ban className="size-4" />, destructive: true, onAction: () => undefined }]}
      />
    </div>
  );
}
