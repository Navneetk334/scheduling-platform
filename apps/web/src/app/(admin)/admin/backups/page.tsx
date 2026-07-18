'use client';

import { Button } from '@invincible/ui';
import { DatabaseBackup } from 'lucide-react';
import * as React from 'react';

import { AdminTable, type AdminColumn } from '@/components/admin/admin-table';
import { PageHeader } from '@/components/dashboard/page-header';
import { StatusBadge } from '@/components/dashboard/status-badge';

interface Backup {
  id: string;
  type: string;
  size: string;
  created: string;
  status: string;
}

const rows: Backup[] = [
  { id: 'bk_240718', type: 'Automated', size: '186 GB', created: 'Today, 02:00', status: 'SUCCEEDED' },
  { id: 'bk_240717', type: 'Automated', size: '185 GB', created: 'Yesterday, 02:00', status: 'SUCCEEDED' },
  { id: 'bk_240716m', type: 'Manual', size: '184 GB', created: 'Jul 16, 14:22', status: 'SUCCEEDED' },
  { id: 'bk_240715', type: 'Automated', size: '184 GB', created: 'Jul 15, 02:00', status: 'FAILED' },
];

const columns: AdminColumn<Backup>[] = [
  { key: 'id', header: 'Backup', render: (r) => <code className="text-xs font-medium">{r.id}</code> },
  { key: 'type', header: 'Type', render: (r) => r.type },
  { key: 'size', header: 'Size', render: (r) => <span className="tabular-nums">{r.size}</span> },
  { key: 'created', header: 'Created', className: 'hidden md:table-cell', render: (r) => <span className="text-muted-foreground">{r.created}</span> },
  { key: 'status', header: 'Status', className: 'text-right', render: (r) => <StatusBadge status={r.status} /> },
];

export default function BackupsPage() {
  return (
    <div>
      <PageHeader
        title="Backup Management"
        description="Automated and manual database backups."
        actions={<Button size="sm"><DatabaseBackup className="size-4" /> Run backup now</Button>}
      />
      <AdminTable
        columns={columns}
        rows={rows}
        getRowKey={(r) => r.id}
        search={(r) => `${r.id} ${r.type}`}
        searchPlaceholder="Search backups…"
        filters={[{ key: 'status', label: 'Status', get: (r) => r.status, options: [
          { label: 'Succeeded', value: 'SUCCEEDED' },
          { label: 'Failed', value: 'FAILED' },
        ] }]}
      />
    </div>
  );
}
