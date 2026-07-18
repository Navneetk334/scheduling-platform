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
  body: string;
  channel: string;
  status: string;
}

const rows: Template[] = [
  { id: 'sms_reminder', name: 'SMS reminder', body: '{{name}}, your meeting starts at {{time}}.', channel: 'SMS', status: 'ACTIVE' },
  { id: 'wa_reminder', name: 'WhatsApp reminder', body: 'Reminder: {{event}} at {{time}}.', channel: 'WhatsApp', status: 'ACTIVE' },
  { id: 'sms_confirm', name: 'SMS confirmation', body: 'Booked! Ref {{reference}}.', channel: 'SMS', status: 'INACTIVE' },
];

const columns: AdminColumn<Template>[] = [
  { key: 'name', header: 'Template', render: (r) => <span className="font-medium">{r.name}</span> },
  { key: 'body', header: 'Body', className: 'hidden md:table-cell', render: (r) => <span className="text-muted-foreground">{r.body}</span> },
  { key: 'channel', header: 'Channel', render: (r) => r.channel },
  { key: 'status', header: 'Status', className: 'text-right', render: (r) => <StatusBadge status={r.status} /> },
];

export default function SmsTemplatesPage() {
  return (
    <div>
      <PageHeader
        title="SMS Templates"
        description="SMS and WhatsApp message templates."
        actions={<Button size="sm"><Plus className="size-4" /> New template</Button>}
      />
      <AdminTable
        columns={columns}
        rows={rows}
        getRowKey={(r) => r.id}
        search={(r) => `${r.name} ${r.body} ${r.channel}`}
        searchPlaceholder="Search templates…"
        filters={[{ key: 'channel', label: 'Channel', get: (r) => r.channel, options: [
          { label: 'SMS', value: 'SMS' },
          { label: 'WhatsApp', value: 'WhatsApp' },
        ] }]}
      />
    </div>
  );
}
