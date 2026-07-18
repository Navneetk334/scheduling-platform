'use client';

import { Button } from '@invincible/ui';
import { CircleDollarSign, Download, TrendingUp, Wallet } from 'lucide-react';
import * as React from 'react';

import { DataTable, type Column } from '@/components/dashboard/data-table';
import { FadeItem, Stagger } from '@/components/dashboard/motion';
import { PageHeader } from '@/components/dashboard/page-header';
import { StatCard } from '@/components/dashboard/stat-card';
import { StatusBadge } from '@/components/dashboard/status-badge';

interface Payment {
  id: string;
  customer: string;
  meeting: string;
  amount: string;
  method: string;
  status: string;
  date: string;
}

const payments: Payment[] = [
  { id: 'py_1', customer: 'Ada Lovelace', meeting: 'Strategy Session', amount: '$150.00', method: 'Visa •• 4242', status: 'SUCCEEDED', date: 'Jul 21' },
  { id: 'py_2', customer: 'Alan Turing', meeting: 'Consulting Hour', amount: '$250.00', method: 'Mastercard •• 5100', status: 'SUCCEEDED', date: 'Jul 20' },
  { id: 'py_3', customer: 'Grace Hopper', meeting: 'Product Demo', amount: '$0.00', method: '—', status: 'REFUNDED', date: 'Jul 19' },
  { id: 'py_4', customer: 'Katherine Johnson', meeting: 'Consulting Hour', amount: '$250.00', method: 'Amex •• 0005', status: 'FAILED', date: 'Jul 18' },
];

const columns: Column<Payment>[] = [
  { key: 'customer', header: 'Customer', render: (r) => <span className="font-medium">{r.customer}</span> },
  { key: 'meeting', header: 'Meeting', className: 'hidden md:table-cell', render: (r) => <span className="text-muted-foreground">{r.meeting}</span> },
  { key: 'method', header: 'Method', className: 'hidden lg:table-cell', render: (r) => <span className="text-muted-foreground">{r.method}</span> },
  { key: 'date', header: 'Date', render: (r) => <span className="text-muted-foreground">{r.date}</span> },
  { key: 'amount', header: 'Amount', render: (r) => <span className="font-medium tabular-nums">{r.amount}</span> },
  { key: 'status', header: 'Status', className: 'text-right', render: (r) => <StatusBadge status={r.status} /> },
];

export default function PaymentsPage() {
  return (
    <div>
      <PageHeader
        title="Payments"
        description="Revenue collected for paid bookings."
        actions={
          <Button variant="outline" size="sm">
            <Download className="size-4" /> Export
          </Button>
        }
      />

      <Stagger className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <FadeItem>
          <StatCard label="Collected (30d)" value="$8,240" icon={Wallet} delta={8.1} trend={[10, 12, 11, 15, 17, 16, 21]} />
        </FadeItem>
        <FadeItem>
          <StatCard label="Avg. order value" value="$186" icon={CircleDollarSign} delta={2.4} trend={[160, 170, 175, 180, 182, 184, 186]} />
        </FadeItem>
        <FadeItem>
          <StatCard label="Success rate" value="94%" icon={TrendingUp} delta={1.1} trend={[90, 91, 92, 93, 93, 94, 94]} />
        </FadeItem>
      </Stagger>

      <DataTable columns={columns} rows={payments} getRowKey={(r) => r.id} />
    </div>
  );
}
