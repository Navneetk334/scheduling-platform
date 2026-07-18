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
  { id: 's1', label: 'Allow new signups', desc: 'Let new organizations register.', on: true },
  { id: 's2', label: 'Require email verification', desc: 'New users must verify their email.', on: true },
  { id: 's3', label: 'Public API enabled', desc: 'Expose the REST + GraphQL APIs.', on: true },
];

export default function SystemSettingsPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <PageHeader title="System Settings" description="Global platform configuration." />

      <Card>
        <CardHeader>
          <CardTitle className="text-base">General</CardTitle>
          <CardDescription>Branding and defaults for the whole platform.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <Field id="name" label="Platform name">
            <Input id="name" defaultValue="INVINCIBLE PROS" />
          </Field>
          <Field id="support" label="Support email">
            <Input id="support" type="email" defaultValue="support@invinciblepros.dev" />
          </Field>
          <Field id="tz" label="Default time zone">
            <Input id="tz" defaultValue="UTC" />
          </Field>
          <Field id="currency" label="Default currency">
            <Input id="currency" defaultValue="USD" />
          </Field>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Platform toggles</CardTitle>
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
        <CardFooter className="justify-end border-t pt-4">
          <Button>Save settings</Button>
        </CardFooter>
      </Card>
    </div>
  );
}
