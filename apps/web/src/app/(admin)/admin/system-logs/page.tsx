'use client';

import { Badge } from '@invincible/ui';
import * as React from 'react';

import { AdminTable, type AdminColumn } from '@/components/admin/admin-table';
import { PageHeader } from '@/components/dashboard/page-header';

interface Log {
  id: string;
  level: string;
  service: string;
  message: string;
  time: string;
}

const levelVariant: Record<string, 'destructive' | 'warning' | 'secondary' | 'default'> = {
  ERROR: 'destructive',
  WARN: 'warning',
  INFO: 'secondary',
  DEBUG: 'default',
};

const rows: Log[] = [
  { id: '1', level: 'INFO', service: 'api', message: 'Booking created (INV-9F2A)', time: '12:04:21' },
  { id: '2', level: 'WARN', service: 'queue', message: 'Webhook retry scheduled (attempt 2)', time: '12:03:58' },
  { id: '3', level: 'ERROR', service: 'db', message: 'Connection pool timeout after 5s', time: '12:01:10' },
  { id: '4', level: 'INFO', service: 'auth', message: 'Session refreshed for user_8821', time: '11:59:02' },
];

const columns: AdminColumn<Log>[] = [
  { key: 'level', header: 'Level', render: (r) => <Badge variant={levelVariant[r.level] ?? 'secondary'}>{r.level}</Badge> },
  { key: 'service', header: 'Service', render: (r) => <code className="text-xs">{r.service}</code> },
  { key: 'message', header: 'Message', render: (r) => <span className="text-muted-foreground">{r.message}</span> },
  { key: 'time', header: 'Time', className: 'text-right', render: (r) => <span className="tabular-nums text-muted-foreground">{r.time}</span> },
];

export default function SystemLogsPage() {
  return (
    <div>
      <PageHeader title="System Logs" description="Structured application logs across services." />
      <AdminTable
        columns={columns}
        rows={rows}
        getRowKey={(r) => r.id}
        search={(r) => `${r.level} ${r.service} ${r.message}`}
        searchPlaceholder="Search logs…"
        filters={[
          { key: 'level', label: 'Level', get: (r) => r.level, options: [
            { label: 'Error', value: 'ERROR' },
            { label: 'Warn', value: 'WARN' },
            { label: 'Info', value: 'INFO' },
          ] },
          { key: 'service', label: 'Service', get: (r) => r.service, options: [
            { label: 'api', value: 'api' },
            { label: 'queue', value: 'queue' },
            { label: 'db', value: 'db' },
            { label: 'auth', value: 'auth' },
          ] },
        ]}
      />
    </div>
  );
}
