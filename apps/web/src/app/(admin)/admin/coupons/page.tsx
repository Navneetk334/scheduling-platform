'use client';

import { Ban } from 'lucide-react';
import * as React from 'react';

import { AdminTable, type AdminColumn } from '@/components/admin/admin-table';
import { PageHeader } from '@/components/dashboard/page-header';
import { StatusBadge } from '@/components/dashboard/status-badge';

interface Coupon {
  id: string;
  code: string;
  type: string;
  amount: string;
  redemptions: string;
  expires: string;
  status: string;
}

const rows: Coupon[] = [
  { id: '1', code: 'LAUNCH25', type: 'Percent', amount: '25%', redemptions: '312 / 1000', expires: 'Dec 31', status: 'ACTIVE' },
  { id: '2', code: 'BLACKFRIDAY', type: 'Percent', amount: '40%', redemptions: '980 / 1000', expires: 'Nov 30', status: 'ACTIVE' },
  { id: '3', code: 'WELCOME10', type: 'Fixed', amount: '$10', redemptions: '4211 / ∞', expires: '—', status: 'ACTIVE' },
  { id: '4', code: 'SPRING20', type: 'Percent', amount: '20%', redemptions: '500 / 500', expires: 'Expired', status: 'INACTIVE' },
];

const columns: AdminColumn<Coupon>[] = [
  { key: 'code', header: 'Code', render: (r) => <code className="rounded bg-muted px-1.5 py-0.5 text-xs font-medium">{r.code}</code> },
  { key: 'type', header: 'Type', render: (r) => r.type },
  { key: 'amount', header: 'Discount', render: (r) => <span className="font-medium">{r.amount}</span> },
  { key: 'redemptions', header: 'Redeemed', className: 'hidden md:table-cell', render: (r) => <span className="text-muted-foreground tabular-nums">{r.redemptions}</span> },
  { key: 'expires', header: 'Expires', className: 'hidden lg:table-cell', render: (r) => <span className="text-muted-foreground">{r.expires}</span> },
  { key: 'status', header: 'Status', className: 'text-right', render: (r) => <StatusBadge status={r.status} /> },
];

export default function CouponsPage() {
  return (
    <div>
      <PageHeader title="Coupons" description="Discount codes across all plans." />
      <AdminTable
        columns={columns}
        rows={rows}
        getRowKey={(r) => r.id}
        search={(r) => `${r.code} ${r.type}`}
        searchPlaceholder="Search coupons…"
        filters={[
          { key: 'status', label: 'Status', get: (r) => r.status, options: [
            { label: 'Active', value: 'ACTIVE' },
            { label: 'Inactive', value: 'INACTIVE' },
          ] },
          { key: 'type', label: 'Type', get: (r) => r.type, options: [
            { label: 'Percent', value: 'Percent' },
            { label: 'Fixed', value: 'Fixed' },
          ] },
        ]}
        bulkActions={[{ label: 'Deactivate', icon: <Ban className="size-4" />, destructive: true, onAction: () => undefined }]}
      />
    </div>
  );
}
