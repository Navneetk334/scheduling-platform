'use client';

import { Avatar, AvatarFallback, Button } from '@invincible/ui';
import { UserPlus } from 'lucide-react';
import * as React from 'react';

import { DataTable, type Column } from '@/components/dashboard/data-table';
import { PageHeader } from '@/components/dashboard/page-header';

interface Customer {
  id: string;
  name: string;
  email: string;
  bookings: number;
  ltv: string;
  last: string;
}

const customers: Customer[] = [
  { id: '1', name: 'Ada Lovelace', email: 'ada@analytical.co', bookings: 12, ltv: '$1,800', last: 'Jul 21' },
  { id: '2', name: 'Alan Turing', email: 'alan@enigma.io', bookings: 8, ltv: '$2,000', last: 'Jul 20' },
  { id: '3', name: 'Grace Hopper', email: 'grace@navy.mil', bookings: 5, ltv: '$0', last: 'Jul 19' },
  { id: '4', name: 'Katherine Johnson', email: 'kj@nasa.gov', bookings: 15, ltv: '$3,750', last: 'Jul 18' },
];

const columns: Column<Customer>[] = [
  {
    key: 'name',
    header: 'Customer',
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
  { key: 'bookings', header: 'Bookings', render: (r) => <span className="tabular-nums">{r.bookings}</span> },
  { key: 'ltv', header: 'Lifetime value', render: (r) => <span className="font-medium tabular-nums">{r.ltv}</span> },
  { key: 'last', header: 'Last booking', className: 'text-right', render: (r) => <span className="text-muted-foreground">{r.last}</span> },
];

export default function CustomersPage() {
  return (
    <div>
      <PageHeader
        title="Customers"
        description="People who have booked time with your organization."
        actions={
          <Button size="sm">
            <UserPlus className="size-4" /> Add customer
          </Button>
        }
      />
      <DataTable columns={columns} rows={customers} getRowKey={(r) => r.id} />
    </div>
  );
}
