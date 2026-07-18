'use client';

import { Button } from '@invincible/ui';
import { Copy, KeyRound, Plus } from 'lucide-react';
import * as React from 'react';

import { DataTable, type Column } from '@/components/dashboard/data-table';
import { EmptyState } from '@/components/dashboard/empty-state';
import { PageHeader } from '@/components/dashboard/page-header';

interface ApiKey {
  id: string;
  name: string;
  prefix: string;
  scopes: string;
  lastUsed: string;
  created: string;
}

const keys: ApiKey[] = [
  { id: '1', name: 'Production', prefix: 'inv_live_9f2a…', scopes: 'read, write', lastUsed: '2h ago', created: 'Jun 12' },
  { id: '2', name: 'Zapier', prefix: 'inv_live_7c13…', scopes: 'read', lastUsed: '1d ago', created: 'May 30' },
  { id: '3', name: 'Staging', prefix: 'inv_test_5b88…', scopes: 'read, write', lastUsed: 'Never', created: 'Jul 01' },
];

const columns: Column<ApiKey>[] = [
  { key: 'name', header: 'Name', render: (r) => <span className="font-medium">{r.name}</span> },
  {
    key: 'prefix',
    header: 'Key',
    render: (r) => (
      <div className="flex items-center gap-2">
        <code className="rounded bg-muted px-1.5 py-0.5 text-xs">{r.prefix}</code>
        <button className="text-muted-foreground hover:text-foreground" aria-label="Copy key prefix">
          <Copy className="size-3.5" />
        </button>
      </div>
    ),
  },
  { key: 'scopes', header: 'Scopes', className: 'hidden md:table-cell', render: (r) => <span className="text-muted-foreground">{r.scopes}</span> },
  { key: 'lastUsed', header: 'Last used', render: (r) => <span className="text-muted-foreground">{r.lastUsed}</span> },
  {
    key: 'actions',
    header: '',
    className: 'text-right',
    render: () => (
      <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive">
        Revoke
      </Button>
    ),
  },
];

export default function ApiKeysPage() {
  return (
    <div>
      <PageHeader
        title="API Keys"
        description="Programmatic access to the INVINCIBLE PROS API."
        actions={
          <Button size="sm">
            <Plus className="size-4" /> Create key
          </Button>
        }
      />
      {keys.length > 0 ? (
        <DataTable columns={columns} rows={keys} getRowKey={(r) => r.id} />
      ) : (
        <EmptyState icon={KeyRound} title="No API keys" description="Create a key to start using the API." />
      )}
    </div>
  );
}
