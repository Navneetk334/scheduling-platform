'use client';

import * as React from 'react';

import { AdminTable, type AdminColumn } from '@/components/admin/admin-table';
import { PageHeader } from '@/components/dashboard/page-header';

interface Permission {
  key: string;
  description: string;
  category: string;
  roles: string;
}

const rows: Permission[] = [
  { key: 'org.manage', description: 'Suspend or delete organizations', category: 'Organizations', roles: 'Super Admin, Support' },
  { key: 'billing.manage', description: 'Manage plans, refunds, invoices', category: 'Billing', roles: 'Super Admin, Finance' },
  { key: 'user.impersonate', description: 'Sign in as a user for support', category: 'Users', roles: 'Super Admin' },
  { key: 'system.maintenance', description: 'Toggle maintenance mode', category: 'System', roles: 'Super Admin' },
  { key: 'logs.read', description: 'View system and audit logs', category: 'Logs', roles: 'Super Admin, Support, Read Only' },
];

const columns: AdminColumn<Permission>[] = [
  { key: 'key', header: 'Permission', render: (r) => <code className="rounded bg-muted px-1.5 py-0.5 text-xs font-medium">{r.key}</code> },
  { key: 'description', header: 'Description', render: (r) => <span className="text-muted-foreground">{r.description}</span> },
  { key: 'category', header: 'Category', className: 'hidden md:table-cell', render: (r) => r.category },
  { key: 'roles', header: 'Granted to', className: 'hidden lg:table-cell', render: (r) => <span className="text-muted-foreground">{r.roles}</span> },
];

export default function PermissionsPage() {
  return (
    <div>
      <PageHeader title="Permissions" description="Fine-grained permissions and the roles that hold them." />
      <AdminTable
        columns={columns}
        rows={rows}
        getRowKey={(r) => r.key}
        search={(r) => `${r.key} ${r.description} ${r.category}`}
        searchPlaceholder="Search permissions…"
        filters={[{ key: 'category', label: 'Category', get: (r) => r.category, options: [
          { label: 'Organizations', value: 'Organizations' },
          { label: 'Billing', value: 'Billing' },
          { label: 'Users', value: 'Users' },
          { label: 'System', value: 'System' },
          { label: 'Logs', value: 'Logs' },
        ] }]}
      />
    </div>
  );
}
