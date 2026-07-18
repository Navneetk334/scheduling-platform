'use client';

import * as React from 'react';

import { AdminTable, type AdminColumn } from '@/components/admin/admin-table';
import { PageHeader } from '@/components/dashboard/page-header';

interface Log {
  id: string;
  actor: string;
  action: string;
  entity: string;
  ip: string;
  time: string;
}

const rows: Log[] = [
  { id: '1', actor: 'admin@invinciblepros.dev', action: 'plan.updated', entity: 'Pro', ip: '203.0.113.4', time: '2m ago' },
  { id: '2', actor: 'admin@invinciblepros.dev', action: 'org.suspended', entity: 'Umbrella', ip: '203.0.113.4', time: '1h ago' },
  { id: '3', actor: 'system', action: 'backup.completed', entity: 'db-primary', ip: '—', time: '3h ago' },
  { id: '4', actor: 'ops@invinciblepros.dev', action: 'feature_flag.toggled', entity: 'ai-assistant', ip: '198.51.100.9', time: 'Yesterday' },
];

const columns: AdminColumn<Log>[] = [
  { key: 'actor', header: 'Actor', render: (r) => <span className="font-medium">{r.actor}</span> },
  { key: 'action', header: 'Action', render: (r) => <code className="rounded bg-muted px-1.5 py-0.5 text-xs">{r.action}</code> },
  { key: 'entity', header: 'Entity', render: (r) => <span className="text-muted-foreground">{r.entity}</span> },
  { key: 'ip', header: 'IP', className: 'hidden md:table-cell', render: (r) => <span className="text-muted-foreground">{r.ip}</span> },
  { key: 'time', header: 'When', className: 'text-right', render: (r) => <span className="text-muted-foreground">{r.time}</span> },
];

export default function AuditLogsPage() {
  return (
    <div>
      <PageHeader title="Audit Logs" description="Immutable record of privileged platform actions." />
      <AdminTable
        columns={columns}
        rows={rows}
        getRowKey={(r) => r.id}
        search={(r) => `${r.actor} ${r.action} ${r.entity}`}
        searchPlaceholder="Search audit logs…"
      />
    </div>
  );
}
