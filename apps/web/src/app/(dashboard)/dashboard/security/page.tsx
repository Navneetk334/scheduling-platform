'use client';

import {
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Field,
  Input,
  Separator,
  Switch,
} from '@invincible/ui';
import { Monitor, Smartphone } from 'lucide-react';
import * as React from 'react';

import { PageHeader } from '@/components/dashboard/page-header';

const sessions = [
  { id: '1', device: 'MacBook Pro · Chrome', location: 'New York, US', current: true, icon: Monitor },
  { id: '2', device: 'iPhone 15 · Safari', location: 'New York, US', current: false, icon: Smartphone },
];

export default function SecurityPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <PageHeader title="Security" description="Protect your account and review active sessions." />

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Password</CardTitle>
          <CardDescription>Update the password used to sign in.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Field id="current" label="Current password">
            <Input id="current" type="password" autoComplete="current-password" />
          </Field>
          <Field id="new" label="New password" description="At least 10 characters.">
            <Input id="new" type="password" autoComplete="new-password" />
          </Field>
          <Button>Update password</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Two-factor authentication</CardTitle>
          <CardDescription>Add an extra layer of security at sign in.</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Require a one-time code via authenticator app.</span>
          <Switch aria-label="Enable two-factor authentication" />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Active sessions</CardTitle>
          <CardDescription>Devices currently signed in to your account.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-1">
          {sessions.map((s, i) => (
            <React.Fragment key={s.id}>
              {i > 0 ? <Separator /> : null}
              <div className="flex items-center justify-between py-3">
                <div className="flex items-center gap-3">
                  <div className="flex size-9 items-center justify-center rounded-lg bg-secondary">
                    <s.icon className="size-4" aria-hidden />
                  </div>
                  <div>
                    <p className="flex items-center gap-2 text-sm font-medium">
                      {s.device}
                      {s.current ? <Badge variant="success">This device</Badge> : null}
                    </p>
                    <p className="text-xs text-muted-foreground">{s.location}</p>
                  </div>
                </div>
                {!s.current ? (
                  <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive">
                    Revoke
                  </Button>
                ) : null}
              </div>
            </React.Fragment>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
