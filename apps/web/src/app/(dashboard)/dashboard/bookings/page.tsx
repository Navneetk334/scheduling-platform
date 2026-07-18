'use client';

import {
  Avatar,
  AvatarFallback,
  Button,
  Tabs,
  TabsList,
  TabsTrigger,
} from '@invincible/ui';
import { Download } from 'lucide-react';
import * as React from 'react';

import { DataTable, type Column } from '@/components/dashboard/data-table';
import { PageHeader } from '@/components/dashboard/page-header';
import { StatusBadge } from '@/components/dashboard/status-badge';

interface Booking {
  id: string;
  invitee: string;
  email: string;
  type: string;
  when: string;
  status: string;
}

const bookings: Booking[] = [
  { id: 'INV-9F2A', invitee: 'Ada Lovelace', email: 'ada@analytical.co', type: 'Intro Call', when: 'Jul 21, 2:30 PM', status: 'CONFIRMED' },
  { id: 'INV-7C13', invitee: 'Alan Turing', email: 'alan@enigma.io', type: 'Strategy Session', when: 'Jul 21, 4:00 PM', status: 'CONFIRMED' },
  { id: 'INV-5B88', invitee: 'Grace Hopper', email: 'grace@navy.mil', type: 'Product Demo', when: 'Jul 22, 10:00 AM', status: 'PENDING' },
  { id: 'INV-3A02', invitee: 'Katherine Johnson', email: 'kj@nasa.gov', type: 'Intro Call', when: 'Jul 19, 1:15 PM', status: 'COMPLETED' },
  { id: 'INV-1D45', invitee: 'Margaret Hamilton', email: 'mh@apollo.io', type: 'Office Hours', when: 'Jul 18, 9:00 AM', status: 'CANCELLED' },
];

const columns: Column<Booking>[] = [
  {
    key: 'invitee',
    header: 'Invitee',
    render: (r) => (
      <div className="flex items-center gap-2.5">
        <Avatar className="size-8">
          <AvatarFallback className="text-[11px]">
            {r.invitee.split(' ').map((p) => p[0]).join('').slice(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0">
          <p className="truncate font-medium">{r.invitee}</p>
          <p className="truncate text-xs text-muted-foreground">{r.email}</p>
        </div>
      </div>
    ),
  },
  { key: 'type', header: 'Meeting type', render: (r) => r.type },
  { key: 'when', header: 'When', render: (r) => <span className="text-muted-foreground">{r.when}</span> },
  { key: 'ref', header: 'Reference', className: 'hidden md:table-cell', render: (r) => <code className="text-xs text-muted-foreground">{r.id}</code> },
  { key: 'status', header: 'Status', className: 'text-right', render: (r) => <StatusBadge status={r.status} /> },
];

export default function BookingsPage() {
  return (
    <div>
      <PageHeader
        title="Bookings"
        description="Every meeting scheduled across your organization."
        actions={
          <Button variant="outline" size="sm">
            <Download className="size-4" /> Export
          </Button>
        }
      />

      <Tabs defaultValue="all" className="mb-4">
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
          <TabsTrigger value="past">Past</TabsTrigger>
          <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
        </TabsList>
      </Tabs>

      <DataTable columns={columns} rows={bookings} getRowKey={(r) => r.id} />
    </div>
  );
}
