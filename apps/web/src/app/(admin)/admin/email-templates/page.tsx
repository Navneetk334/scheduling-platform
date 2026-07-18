'use client';

import { Button } from '@invincible/ui';
import { Plus } from 'lucide-react';
import * as React from 'react';

import { AdminTable, type AdminColumn } from '@/components/admin/admin-table';
import { PageHeader } from '@/components/dashboard/page-header';
import { StatusBadge } from '@/components/dashboard/status-badge';

interface Template {
  id: string;
  name: string;
  subject: string;
  updated: string;
  status: string;
}

const rows: Template[] = [
  { id: 'booking_confirmation', name: 'Booking confirmation', subject: 'Your booking is confirmed', updated: 'Jul 10', status: 'ACTIVE' },
  { id: 'reminder', name: 'Reminder', subject: 'Reminder: {{event}} soon', updated: 'Jul 08', status: 'ACTIVE' },
  { id: 'cancellation', name: 'Cancellation', subject: 'Your booking was cancelled', updated: 'Jul 02', status: 'ACTIVE' },
  { id: 'password_reset', name: 'Password reset', subject: 'Reset your password', updated: 'Jun 20', status: 'ACTIVE' },
];

const columns: AdminColumn<Template>[] = [
  { key: 'name', header: 'Template', render: (r) => <span className="font-medium">{r.name}</span> },
  { key: 'subject', header: 'Subject', className: 'hidden md:table-cell', render: (r) => <span className="text-muted-foreground">{r.subject}</span> },
  { key: 'updated', header: 'Updated', render: (r) => <span className="text-muted-foreground">{r.updated}</span> },
  { key: 'status', header: 'Status', className: 'text-right', render: (r) => <StatusBadge status={r.status} /> },
];

export default function EmailTemplatesPage() {
  return (
    <div>
      <PageHeader
        title="Email Templates"
        description="Transactional email templates."
        actions={<Button size="sm"><Plus className="size-4" /> New template</Button>}
      />
      <AdminTable
        columns={columns}
        rows={rows}
        getRowKey={(r) => r.id}
        search={(r) => `${r.name} ${r.subject}`}
        searchPlaceholder="Search templates…"
      />
    </div>
  );
}
