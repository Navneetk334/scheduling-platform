'use client';

import { Badge, Button, Card, CardContent, CardDescription, CardHeader, CardTitle } from '@invincible/ui';
import { Plus, ShieldCheck } from 'lucide-react';
import * as React from 'react';

import { FadeItem, Stagger } from '@/components/dashboard/motion';
import { PageHeader } from '@/components/dashboard/page-header';

const roles = [
  { id: '1', name: 'Super Admin', description: 'Unrestricted access to every module.', admins: 3, permissions: 'All', system: true },
  { id: '2', name: 'Support', description: 'Manage tickets, users, and orgs.', admins: 8, permissions: '18', system: true },
  { id: '3', name: 'Finance', description: 'Billing, payments, refunds, invoices.', admins: 4, permissions: '11', system: true },
  { id: '4', name: 'Read Only', description: 'View dashboards and logs.', admins: 6, permissions: '9', system: false },
];

export default function AdminRolesPage() {
  return (
    <div>
      <PageHeader
        title="Roles"
        description="Platform administrator roles."
        actions={<Button size="sm"><Plus className="size-4" /> New role</Button>}
      />
      <Stagger className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {roles.map((role) => (
          <FadeItem key={role.id}>
            <Card className="h-full">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <ShieldCheck className="size-4" aria-hidden />
                    </div>
                    <CardTitle className="text-base">{role.name}</CardTitle>
                  </div>
                  <Badge variant={role.system ? 'secondary' : 'outline'}>{role.system ? 'System' : 'Custom'}</Badge>
                </div>
                <CardDescription>{role.description}</CardDescription>
              </CardHeader>
              <CardContent className="flex items-center justify-between text-sm text-muted-foreground">
                <span><strong className="text-foreground">{role.admins}</strong> admins · <strong className="text-foreground">{role.permissions}</strong> permissions</span>
                <Button variant="ghost" size="sm" disabled={role.system}>Edit</Button>
              </CardContent>
            </Card>
          </FadeItem>
        ))}
      </Stagger>
    </div>
  );
}
