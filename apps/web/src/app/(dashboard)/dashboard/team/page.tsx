'use client';

import {
  Avatar,
  AvatarFallback,
  Badge,
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@invincible/ui';
import { MoreHorizontal, UserPlus } from 'lucide-react';
import * as React from 'react';

import { DataTable, type Column } from '@/components/dashboard/data-table';
import { PageHeader } from '@/components/dashboard/page-header';
import { StatusBadge } from '@/components/dashboard/status-badge';

interface Member {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
}

const members: Member[] = [
  { id: '1', name: 'Demo Founder', email: 'founder@invinciblepros.dev', role: 'Owner', status: 'ACTIVE' },
  { id: '2', name: 'Grace Hopper', email: 'grace@invinciblepros.dev', role: 'Admin', status: 'ACTIVE' },
  { id: '3', name: 'Alan Turing', email: 'alan@invinciblepros.dev', role: 'Member', status: 'ACTIVE' },
  { id: '4', name: 'Katherine Johnson', email: 'katherine@invinciblepros.dev', role: 'Member', status: 'PENDING' },
];

const columns: Column<Member>[] = [
  {
    key: 'name',
    header: 'Member',
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
  { key: 'role', header: 'Role', render: (r) => <Badge variant="secondary">{r.role}</Badge> },
  { key: 'status', header: 'Status', render: (r) => <StatusBadge status={r.status} /> },
  {
    key: 'actions',
    header: '',
    className: 'text-right',
    render: () => (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" aria-label="Member actions">
            <MoreHorizontal className="size-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem>Change role</DropdownMenuItem>
          <DropdownMenuItem>Resend invite</DropdownMenuItem>
          <DropdownMenuItem className="text-destructive focus:text-destructive">Remove</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    ),
  },
];

export default function TeamPage() {
  return (
    <div>
      <PageHeader
        title="Team"
        description="Manage who has access to your workspace."
        actions={
          <Button size="sm">
            <UserPlus className="size-4" /> Invite member
          </Button>
        }
      />
      <DataTable columns={columns} rows={members} getRowKey={(r) => r.id} />
    </div>
  );
}
