'use client';

import {
  Alert,
  AlertDescription,
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
import { AlertTriangle } from 'lucide-react';
import * as React from 'react';

import { PageHeader } from '@/components/dashboard/page-header';

export default function MaintenancePage() {
  const [enabled, setEnabled] = React.useState(false);

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <PageHeader title="Maintenance Mode" description="Temporarily take the platform offline for maintenance." />

      {enabled ? (
        <Alert variant="warning">
          <AlertTriangle className="size-4" aria-hidden />
          <AlertDescription>
            Maintenance mode is ON — visitors see the maintenance page and bookings are paused.
          </AlertDescription>
        </Alert>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Status</CardTitle>
          <CardDescription>Toggle maintenance mode for the entire platform.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <label className="flex items-center justify-between">
            <span className="text-sm font-medium">Enable maintenance mode</span>
            <Switch checked={enabled} onCheckedChange={setEnabled} aria-label="Enable maintenance mode" />
          </label>
          <Field id="msg" label="Message shown to visitors">
            <Input id="msg" defaultValue="We'll be back shortly. Scheduled maintenance in progress." />
          </Field>
          <Field id="window" label="Scheduled window (optional)">
            <Input id="window" placeholder="e.g. 2026-08-01 02:00–03:00 UTC" />
          </Field>
        </CardContent>
        <CardFooter className="justify-end border-t pt-4">
          <Button variant={enabled ? 'destructive' : 'primary'}>{enabled ? 'Update' : 'Save'}</Button>
        </CardFooter>
      </Card>
    </div>
  );
}
