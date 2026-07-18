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
  Separator,
  Switch,
} from '@invincible/ui';
import * as React from 'react';

import { PageHeader } from '@/components/dashboard/page-header';

const toggles = [
  { id: 't1', label: 'Enforce 2FA for all admins', desc: 'Require a second factor to access the admin console.', on: true },
  { id: 't2', label: 'IP allow-list', desc: 'Restrict admin access to approved IP ranges.', on: false },
  { id: 't3', label: 'Force password rotation', desc: 'Require admins to rotate passwords every 90 days.', on: false },
  { id: 't4', label: 'Audit all admin actions', desc: 'Record every privileged action to the audit log.', on: true },
];

export default function SecurityPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <PageHeader title="Security" description="Platform-wide security policies." />

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Policies</CardTitle>
          <CardDescription>Applied to all administrator accounts.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-1">
          {toggles.map((t, i) => (
            <React.Fragment key={t.id}>
              {i > 0 ? <Separator /> : null}
              <label className="flex items-center justify-between gap-4 py-3">
                <span>
                  <span className="block text-sm font-medium">{t.label}</span>
                  <span className="block text-xs text-muted-foreground">{t.desc}</span>
                </span>
                <Switch defaultChecked={t.on} aria-label={t.label} />
              </label>
            </React.Fragment>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Session policy</CardTitle>
          <CardDescription>Control admin session lifetime.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <Field id="idle" label="Idle timeout (minutes)">
            <Input id="idle" type="number" defaultValue={30} />
          </Field>
          <Field id="max" label="Max session (hours)">
            <Input id="max" type="number" defaultValue={12} />
          </Field>
        </CardContent>
        <CardFooter className="justify-end border-t pt-4">
          <Button>Save policies</Button>
        </CardFooter>
      </Card>
    </div>
  );
}
