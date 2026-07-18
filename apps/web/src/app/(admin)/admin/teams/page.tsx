'use client';

import * as React from 'react';

import { AdminTable, type AdminColumn } from '@/components/admin/admin-table';
import { PageHeader } from '@/components/dashboard/page-header';

interface Team {
  id: string;
  name: string;
  org: string;
  members: number;
  lead: string;
}

const rows: Team[] = [
  { id: '1', name: 'Sales', org: 'Acme Inc', members: 8, lead: 'Ada Lovelace' },
  { id: '2', name: 'Success', org: 'Acme Inc', members: 5, lead: 'Grace Hopper' },
  { id: '3', name: 'Recruiting', org: 'Initech', members: 12, lead: 'Alan Turing' },
  { id: '4', name: 'Support', org: 'Globex', members: 3, lead: 'Katherine Johnson' },
];

const columns: AdminColumn<Team>[] = [
  { key: 'name', header: 'Team', render: (r) => <span className="font-medium">{r.name}</span> },
  { key: 'org', header: 'Organization', render: (r) => <span className="text-muted-foreground">{r.org}</span> },
  { key: 'members', header: 'Members', render: (r) => <span className="tabular-nums">{r.members}</span> },
  { key: 'lead', header: 'Lead', className: 'text-right', render: (r) => r.lead },
];

export default function AdminTeamsPage() {
  return (
    <div>
      <PageHeader title="Teams" description="Teams across all organizations." />
      <AdminTable
        columns={columns}
        rows={rows}
        getRowKey={(r) => r.id}
        search={(r) => `${r.name} ${r.org} ${r.lead}`}
        searchPlaceholder="Search teams…"
        filters={[{ key: 'org', label: 'Org', get: (r) => r.org, options: [
          { label: 'Acme Inc', value: 'Acme Inc' },
          { label: 'Initech', value: 'Initech' },
          { label: 'Globex', value: 'Globex' },
        ] }]}
      />
    </div>
  );
}
