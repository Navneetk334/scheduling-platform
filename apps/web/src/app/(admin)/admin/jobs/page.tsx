'use client';

import { RefreshCcw, Trash2 } from 'lucide-react';
import * as React from 'react';

import { AdminTable, type AdminColumn } from '@/components/admin/admin-table';
import { PageHeader } from '@/components/dashboard/page-header';
import { StatusBadge } from '@/components/dashboard/status-badge';

interface Job {
  id: string;
  queue: string;
  name: string;
  attempts: number;
  status: string;
  time: string;
}

const rows: Job[] = [
  { id: 'j_9012', queue: 'webhooks', name: 'deliver', attempts: 1, status: 'COMPLETED', time: '1m ago' },
  { id: 'j_9011', queue: 'notifications', name: 'reminder', attempts: 1, status: 'ACTIVE', time: 'now' },
  { id: 'j_9008', queue: 'webhooks', name: 'deliver', attempts: 3, status: 'FAILED', time: '6m ago' },
  { id: 'j_9004', queue: 'calendar-sync', name: 'sync', attempts: 2, status: 'PENDING', time: '10m ago' },
];

const columns: AdminColumn<Job>[] = [
  { key: 'id', header: 'Job', render: (r) => <code className="text-xs">{r.id}</code> },
  { key: 'queue', header: 'Queue', render: (r) => r.queue },
  { key: 'name', header: 'Name', render: (r) => <code className="text-xs">{r.name}</code> },
  { key: 'attempts', header: 'Attempts', render: (r) => <span className="tabular-nums">{r.attempts}</span> },
  { key: 'time', header: 'When', className: 'hidden md:table-cell', render: (r) => <span className="text-muted-foreground">{r.time}</span> },
  { key: 'status', header: 'Status', className: 'text-right', render: (r) => <StatusBadge status={r.status} /> },
];

export default function JobsPage() {
  return (
    <div>
      <PageHeader title="Background Jobs" description="Individual queue jobs and their lifecycle." />
      <AdminTable
        columns={columns}
        rows={rows}
        getRowKey={(r) => r.id}
        search={(r) => `${r.id} ${r.queue} ${r.name}`}
        searchPlaceholder="Search jobs…"
        filters={[
          { key: 'status', label: 'Status', get: (r) => r.status, options: [
            { label: 'Completed', value: 'COMPLETED' },
            { label: 'Active', value: 'ACTIVE' },
            { label: 'Failed', value: 'FAILED' },
            { label: 'Pending', value: 'PENDING' },
          ] },
          { key: 'queue', label: 'Queue', get: (r) => r.queue, options: [
            { label: 'webhooks', value: 'webhooks' },
            { label: 'notifications', value: 'notifications' },
            { label: 'calendar-sync', value: 'calendar-sync' },
          ] },
        ]}
        bulkActions={[
          { label: 'Retry', icon: <RefreshCcw className="size-4" />, onAction: () => undefined },
          { label: 'Remove', icon: <Trash2 className="size-4" />, destructive: true, onAction: () => undefined },
        ]}
      />
    </div>
  );
}
