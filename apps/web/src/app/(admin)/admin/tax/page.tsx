'use client';

import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  Field,
  Input,
  Switch,
} from '@invincible/ui';
import * as React from 'react';

import { AdminTable, type AdminColumn } from '@/components/admin/admin-table';
import { PageHeader } from '@/components/dashboard/page-header';

interface TaxRate {
  id: string;
  region: string;
  rate: string;
  type: string;
}

const rates: TaxRate[] = [
  { id: '1', region: 'European Union', rate: '20%', type: 'VAT' },
  { id: '2', region: 'United Kingdom', rate: '20%', type: 'VAT' },
  { id: '3', region: 'California, US', rate: '7.25%', type: 'Sales Tax' },
  { id: '4', region: 'India', rate: '18%', type: 'GST' },
];

const columns: AdminColumn<TaxRate>[] = [
  { key: 'region', header: 'Region', render: (r) => <span className="font-medium">{r.region}</span> },
  { key: 'type', header: 'Type', render: (r) => r.type },
  { key: 'rate', header: 'Rate', className: 'text-right', render: (r) => <span className="tabular-nums">{r.rate}</span> },
];

export default function TaxSettingsPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Tax Settings" description="Configure tax collection and regional rates." />

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Collection</CardTitle>
          <CardDescription>Automatically calculate and collect tax at checkout.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <label className="flex items-center justify-between">
            <span className="text-sm font-medium">Enable automatic tax</span>
            <Switch defaultChecked aria-label="Enable automatic tax" />
          </label>
          <Field id="taxid" label="Company tax ID">
            <Input id="taxid" defaultValue="EU372000000" />
          </Field>
        </CardContent>
        <CardFooter className="justify-end border-t pt-4">
          <Button>Save</Button>
        </CardFooter>
      </Card>

      <div>
        <h3 className="mb-2 text-sm font-semibold">Regional rates</h3>
        <AdminTable
          columns={columns}
          rows={rates}
          getRowKey={(r) => r.id}
          search={(r) => `${r.region} ${r.type}`}
          searchPlaceholder="Search rates…"
        />
      </div>
    </div>
  );
}
