'use client';

import { Avatar, AvatarFallback } from '@invincible/ui';
import { Ban, Trash2 } from 'lucide-react';
import * as React from 'react';

import { AdminTable, type AdminColumn } from '@/components/admin/admin-table';
import { PageHeader } from '@/components/dashboard/page-header';
import { StatusBadge } from '@/components/dashboard/status-badge';

interface User {
  id: string;
  name: string;
  email: string;
  orgs: number;
  plan: string;
  status: string;
  joined: string;
}

const users: User[] = [
  { id: '1', name: 'Ada Lovelace', email: 'ada@analytical.co', orgs: 2, plan: 'Pro', status: 'ACTIVE', joined: 'Jan 12' },
  { id: '2', name: 'Alan Turing', email: 'alan@enigma.io', orgs: 1, plan: 'Team', status: 'ACTIVE', joined: 'Feb 03' },
  { id: '3', name: 'Grace Hopper', email: 'grace@navy.mil', orgs: 3, plan: 'Enterprise', status: 'ACTIVE', joined: 'Mar 21' },
  { id: '4', name: 'Katherine Johnson', email: 'kj@nasa.gov', orgs: 1, plan: 'Free', status: 'SUSPENDED', joined: 'Apr 08' },
  { id: '5', name: 'Margaret Hamilton', email: 'mh@apollo.io', orgs: 2, plan: 'Pro', status: 'ACTIVE', joined: 'May 19' },
];

const columns: AdminColumn<User>[] = [
  {
    key: 'name',
    header: 'User',
    render: (r) => (
      <div className="flex items-center gap-2.5">
        <Avatar className="size-8">
          <AvatarFallback className="text-[11px]">
            {r.name.split(' ').map((p) => p[0]).join('').slice(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div>
          <p className="font-medium">{r.name}</p>
          <p className="text-xs text-muted-foreground">{r.email}</p>
        </div>
      </div>
    ),
  },
  { key: 'orgs', header: 'Orgs', render: (r) => <span className="tabular-nums">{r.orgs}</span> },
  { key: 'plan', header: 'Plan', render: (r) => r.plan },
  { key: 'joined', header: 'Joined', className: 'hidden md:table-cell', render: (r) => <span className="text-muted-foreground">{r.joined}</span> },
  { key: 'status', header: 'Status', className: 'text-right', render: (r) => <StatusBadge status={r.status} /> },
];

export default function AdminUsersPage() {
  return (
    <div>
      <PageHeader title="Users" description="Every user account across the platform." />
      <AdminTable
        columns={columns}
        rows={users}
        getRowKey={(r) => r.id}
        search={(r) => `${r.name} ${r.email} ${r.plan}`}
        searchPlaceholder="Search users…"
        filters={[
          { key: 'status', label: 'Status', get: (r) => r.status, options: [
            { label: 'Active', value: 'ACTIVE' },
            { label: 'Suspended', value: 'SUSPENDED' },
          ] },
          { key: 'plan', label: 'Plan', get: (r) => r.plan, options: [
            { label: 'Free', value: 'Free' },
            { label: 'Pro', value: 'Pro' },
            { label: 'Team', value: 'Team' },
            { label: 'Enterprise', value: 'Enterprise' },
          ] },
        ]}
        bulkActions={[
          { label: 'Suspend', icon: <Ban className="size-4" />, onAction: () => undefined },
          { label: 'Delete', icon: <Trash2 className="size-4" />, destructive: true, onAction: () => undefined },
        ]}
      />
    </div>
  );
}
