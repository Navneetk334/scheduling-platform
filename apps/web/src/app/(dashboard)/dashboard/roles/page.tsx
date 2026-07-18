'use client';

import { Badge, Button, Card, CardContent, CardDescription, CardHeader, CardTitle } from '@invincible/ui';
import { Plus, ShieldCheck } from 'lucide-react';
import * as React from 'react';

import { FadeItem, Stagger } from '@/components/dashboard/motion';
import { PageHeader } from '@/components/dashboard/page-header';

interface Role {
  id: string;
  name: string;
  description: string;
  members: number;
  permissions: number;
  system: boolean;
}

const roles: Role[] = [
  { id: '1', name: 'Owner', description: 'Full access to everything, including billing.', members: 1, permissions: 9, system: true },
  { id: '2', name: 'Admin', description: 'Manage members, scheduling, and bookings.', members: 1, permissions: 7, system: true },
  { id: '3', name: 'Member', description: 'Create meeting types and manage own bookings.', members: 2, permissions: 4, system: true },
  { id: '4', name: 'Finance', description: 'Access to payments, invoices, and billing.', members: 0, permissions: 3, system: false },
];

export default function RolesPage() {
  return (
    <div>
      <PageHeader
        title="Roles"
        description="Role-based access control for your organization."
        actions={
          <Button size="sm">
            <Plus className="size-4" /> New role
          </Button>
        }
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
                  {role.system ? <Badge variant="secondary">System</Badge> : <Badge variant="outline">Custom</Badge>}
                </div>
                <CardDescription>{role.description}</CardDescription>
              </CardHeader>
              <CardContent className="flex items-center justify-between">
                <div className="flex gap-4 text-sm text-muted-foreground">
                  <span>
                    <strong className="text-foreground">{role.members}</strong> members
                  </span>
                  <span>
                    <strong className="text-foreground">{role.permissions}</strong> permissions
                  </span>
                </div>
                <Button variant="ghost" size="sm" disabled={role.system}>
                  Edit
                </Button>
              </CardContent>
            </Card>
          </FadeItem>
        ))}
      </Stagger>
    </div>
  );
}
