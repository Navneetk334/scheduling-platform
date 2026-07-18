'use client';

import * as React from 'react';

import { AdminTable, type AdminColumn } from '@/components/admin/admin-table';
import { PageHeader } from '@/components/dashboard/page-header';
import { StatusBadge } from '@/components/dashboard/status-badge';

interface Server {
  id: string;
  name: string;
  region: string;
  role: string;
  cpu: string;
  memory: string;
  status: string;
}

const rows: Server[] = [
  { id: '1', name: 'api-01', region: 'us-east-1', role: 'API', cpu: '38%', memory: '61%', status: 'ACTIVE' },
  { id: '2', name: 'api-02', region: 'eu-west-1', role: 'API', cpu: '44%', memory: '58%', status: 'ACTIVE' },
  { id: '3', name: 'worker-01', region: 'us-east-1', role: 'Worker', cpu: '72%', memory: '69%', status: 'ACTIVE' },
  { id: '4', name: 'db-primary', region: 'us-east-1', role: 'Database', cpu: '51%', memory: '77%', status: 'ACTIVE' },
  { id: '5', name: 'worker-02', region: 'ap-south-1', role: 'Worker', cpu: '0%', memory: '4%', status: 'INACTIVE' },
];

const columns: AdminColumn<Server>[] = [
  { key: 'name', header: 'Server', render: (r) => <code className="text-xs font-medium">{r.name}</code> },
  { key: 'region', header: 'Region', render: (r) => <span className="text-muted-foreground">{r.region}</span> },
  { key: 'role', header: 'Role', render: (r) => r.role },
  { key: 'cpu', header: 'CPU', render: (r) => <span className="tabular-nums">{r.cpu}</span> },
  { key: 'memory', header: 'Memory', className: 'hidden md:table-cell', render: (r) => <span className="tabular-nums">{r.memory}</span> },
  { key: 'status', header: 'Status', className: 'text-right', render: (r) => <StatusBadge status={r.status} /> },
];

export default function ServersPage() {
  return (
    <div>
      <PageHeader title="Servers" description="Compute fleet health across regions." />
      <AdminTable
        columns={columns}
        rows={rows}
        getRowKey={(r) => r.id}
        search={(r) => `${r.name} ${r.region} ${r.role}`}
        searchPlaceholder="Search servers…"
        filters={[
          { key: 'role', label: 'Role', get: (r) => r.role, options: [
            { label: 'API', value: 'API' },
            { label: 'Worker', value: 'Worker' },
            { label: 'Database', value: 'Database' },
          ] },
          { key: 'region', label: 'Region', get: (r) => r.region, options: [
            { label: 'us-east-1', value: 'us-east-1' },
            { label: 'eu-west-1', value: 'eu-west-1' },
            { label: 'ap-south-1', value: 'ap-south-1' },
          ] },
        ]}
      />
    </div>
  );
}
