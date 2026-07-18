'use client';

import { Switch } from '@invincible/ui';
import * as React from 'react';

import { AdminTable, type AdminColumn } from '@/components/admin/admin-table';
import { PageHeader } from '@/components/dashboard/page-header';

interface Flag {
  key: string;
  description: string;
  rollout: string;
  enabled: boolean;
}

const initial: Flag[] = [
  { key: 'ai-assistant', description: 'AI scheduling assistant', rollout: '100%', enabled: true },
  { key: 'graphql-api', description: 'Public GraphQL API', rollout: '100%', enabled: true },
  { key: 'whatsapp-reminders', description: 'WhatsApp reminders', rollout: '25%', enabled: true },
  { key: 'new-booking-ui', description: 'Redesigned booking wizard', rollout: '50%', enabled: false },
];

export default function FeatureFlagsPage() {
  const [flags, setFlags] = React.useState(initial);

  const toggle = (key: string) =>
    setFlags((prev) => prev.map((f) => (f.key === key ? { ...f, enabled: !f.enabled } : f)));

  const columns: AdminColumn<Flag>[] = [
    { key: 'key', header: 'Flag', render: (r) => <code className="rounded bg-muted px-1.5 py-0.5 text-xs font-medium">{r.key}</code> },
    { key: 'description', header: 'Description', render: (r) => <span className="text-muted-foreground">{r.description}</span> },
    { key: 'rollout', header: 'Rollout', render: (r) => <span className="tabular-nums">{r.rollout}</span> },
    {
      key: 'enabled',
      header: 'Enabled',
      className: 'text-right',
      render: (r) => (
        <div className="flex justify-end">
          <Switch checked={r.enabled} onCheckedChange={() => toggle(r.key)} aria-label={`Toggle ${r.key}`} />
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageHeader title="Feature Flags" description="Roll features out gradually across the platform." />
      <AdminTable
        columns={columns}
        rows={flags}
        getRowKey={(r) => r.key}
        search={(r) => `${r.key} ${r.description}`}
        searchPlaceholder="Search flags…"
        bulkActions={[
          { label: 'Enable', onAction: (keys) => setFlags((p) => p.map((f) => (keys.includes(f.key) ? { ...f, enabled: true } : f))) },
          { label: 'Disable', destructive: true, onAction: (keys) => setFlags((p) => p.map((f) => (keys.includes(f.key) ? { ...f, enabled: false } : f))) },
        ]}
      />
    </div>
  );
}
