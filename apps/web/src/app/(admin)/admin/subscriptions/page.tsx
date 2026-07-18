'use client';

import { Ban } from 'lucide-react';
import * as React from 'react';

import { AdminTable, type AdminColumn } from '@/components/admin/admin-table';
import { PageHeader } from '@/components/dashboard/page-header';
import { StatusBadge } from '@/components/dashboard/status-badge';

interface Sub {
  id: string;
  org: string;
  plan: string;
  status: string;
  mrr: string;
  renews: string;
}

const rows: Sub[] = [
  { id: '1', org: 'Acme Inc', plan: 'Team', status: 'ACTIVE', mrr: '$490', renews: 'Aug 12' },
  { id: '2', org: 'Globex', plan: 'Pro', status: 'ACTIVE', mrr: '$150', renews: 'Aug 03' },
  { id: '3', org: 'Initech', plan: 'Enterprise', status: 'ACTIVE', mrr: '$2,400', renews: 'Sep 01' },
  { id: '4', org: 'Hooli', plan: 'Pro', status: 'PAST_DUE', mrr: '$150', renews: 'Overdue' },
];

const columns: AdminColumn<Sub>[] = [
  { key: 'org', header: 'Organization', render: (r) => <span className="font-medium">{r.org}</span> },
  { key: 'plan', header: 'Plan', render: (r) => r.plan },
  { key: 'mrr', header: 'MRR', render: (r) => <span className="font-medium tabular-nums">{r.mrr}</span> },
  { key: 'renews', header: 'Renews', className: 'hidden md:table-cell', render: (r) => <span className="text-muted-foreground">{r.renews}</span> },
  { key: 'status', header: 'Status', className: 'text-right', render: (r) => <StatusBadge status={r.status} /> },
];

export default function SubscriptionsPage() {
  return (
    <div>
      <PageHeader title="Subscriptions" description="Active and past-due subscriptions across tenants." />
      <AdminTable
        columns={columns}
        rows={rows}
        getRowKey={(r) => r.id}
        search={(r) => `${r.org} ${r.plan}`}
        searchPlaceholder="Search subscriptions…"
        filters={[
          { key: 'status', label: 'Status', get: (r) => r.status, options: [
            { label: 'Active', value: 'ACTIVE' },
            { label: 'Past due', value: 'PAST_DUE' },
          ] },
          { key: 'plan', label: 'Plan', get: (r) => r.plan, options: [
            { label: 'Pro', value: 'Pro' },
            { label: 'Team', value: 'Team' },
            { label: 'Enterprise', value: 'Enterprise' },
          ] },
        ]}
        bulkActions={[{ label: 'Cancel', icon: <Ban className="size-4" />, destructive: true, onAction: () => undefined }]}
      />
    </div>
  );
}
