'use client';

import { Button } from '@invincible/ui';
import { Plus, Trash2 } from 'lucide-react';
import * as React from 'react';

import { AdminTable, type AdminColumn } from '@/components/admin/admin-table';
import { PageHeader } from '@/components/dashboard/page-header';
import { StatusBadge } from '@/components/dashboard/status-badge';

interface Announcement {
  id: string;
  title: string;
  audience: string;
  status: string;
  published: string;
}

const rows: Announcement[] = [
  { id: '1', title: 'New: AI scheduling assistant', audience: 'All users', status: 'ACTIVE', published: 'Jul 15' },
  { id: '2', title: 'Scheduled maintenance Aug 1', audience: 'All users', status: 'ACTIVE', published: 'Jul 18' },
  { id: '3', title: 'Enterprise SSO now available', audience: 'Enterprise', status: 'INACTIVE', published: 'Jun 30' },
];

const columns: AdminColumn<Announcement>[] = [
  { key: 'title', header: 'Title', render: (r) => <span className="font-medium">{r.title}</span> },
  { key: 'audience', header: 'Audience', render: (r) => r.audience },
  { key: 'published', header: 'Published', className: 'hidden md:table-cell', render: (r) => <span className="text-muted-foreground">{r.published}</span> },
  { key: 'status', header: 'Status', className: 'text-right', render: (r) => <StatusBadge status={r.status} /> },
];

export default function AnnouncementsPage() {
  return (
    <div>
      <PageHeader
        title="Announcements"
        description="Product announcements shown in-app."
        actions={<Button size="sm"><Plus className="size-4" /> New announcement</Button>}
      />
      <AdminTable
        columns={columns}
        rows={rows}
        getRowKey={(r) => r.id}
        search={(r) => `${r.title} ${r.audience}`}
        searchPlaceholder="Search announcements…"
        filters={[{ key: 'status', label: 'Status', get: (r) => r.status, options: [
          { label: 'Active', value: 'ACTIVE' },
          { label: 'Inactive', value: 'INACTIVE' },
        ] }]}
        bulkActions={[{ label: 'Delete', icon: <Trash2 className="size-4" />, destructive: true, onAction: () => undefined }]}
      />
    </div>
  );
}
