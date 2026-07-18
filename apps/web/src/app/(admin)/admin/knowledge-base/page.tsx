'use client';

import { Button } from '@invincible/ui';
import { Plus } from 'lucide-react';
import * as React from 'react';

import { AdminTable, type AdminColumn } from '@/components/admin/admin-table';
import { PageHeader } from '@/components/dashboard/page-header';
import { StatusBadge } from '@/components/dashboard/status-badge';

interface Article {
  id: string;
  title: string;
  category: string;
  views: number;
  status: string;
}

const rows: Article[] = [
  { id: '1', title: 'Connecting your Google Calendar', category: 'Integrations', views: 12840, status: 'ACTIVE' },
  { id: '2', title: 'Setting up round-robin events', category: 'Scheduling', views: 8210, status: 'ACTIVE' },
  { id: '3', title: 'Understanding your invoice', category: 'Billing', views: 4530, status: 'ACTIVE' },
  { id: '4', title: 'Webhook payload reference', category: 'Developers', views: 2110, status: 'DRAFT' },
];

const columns: AdminColumn<Article>[] = [
  { key: 'title', header: 'Article', render: (r) => <span className="font-medium">{r.title}</span> },
  { key: 'category', header: 'Category', render: (r) => r.category },
  { key: 'views', header: 'Views', render: (r) => <span className="tabular-nums">{r.views.toLocaleString()}</span> },
  { key: 'status', header: 'Status', className: 'text-right', render: (r) => <StatusBadge status={r.status} /> },
];

export default function KnowledgeBasePage() {
  return (
    <div>
      <PageHeader
        title="Knowledge Base"
        description="Help center articles and their performance."
        actions={<Button size="sm"><Plus className="size-4" /> New article</Button>}
      />
      <AdminTable
        columns={columns}
        rows={rows}
        getRowKey={(r) => r.id}
        search={(r) => `${r.title} ${r.category}`}
        searchPlaceholder="Search articles…"
        filters={[{ key: 'category', label: 'Category', get: (r) => r.category, options: [
          { label: 'Integrations', value: 'Integrations' },
          { label: 'Scheduling', value: 'Scheduling' },
          { label: 'Billing', value: 'Billing' },
          { label: 'Developers', value: 'Developers' },
        ] }]}
      />
    </div>
  );
}
