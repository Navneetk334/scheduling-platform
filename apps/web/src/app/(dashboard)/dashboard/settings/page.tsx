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
} from '@invincible/ui';
import * as React from 'react';

import { PageHeader } from '@/components/dashboard/page-header';
import { useActiveOrganization } from '@/hooks/use-organizations';

export default function SettingsPage() {
  const { activeOrganization } = useActiveOrganization();

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <PageHeader title="Settings" description="Manage your organization profile and preferences." />

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Organization</CardTitle>
          <CardDescription>This information appears on your public booking pages.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Field id="org-name" label="Organization name">
            <Input id="org-name" defaultValue={activeOrganization?.name ?? 'Invincible Pros'} />
          </Field>
          <Field id="org-slug" label="Booking URL" description="Used in your public links.">
            <div className="flex items-center rounded-md border border-input focus-within:ring-2 focus-within:ring-ring">
              <span className="px-3 text-sm text-muted-foreground">invinciblepros.com/</span>
              <input
                id="org-slug"
                defaultValue={activeOrganization?.slug ?? 'your-org'}
                className="h-10 flex-1 rounded-r-md bg-transparent pr-3 text-sm outline-none"
              />
            </div>
          </Field>
          <Field id="org-tz" label="Default time zone">
            <Input id="org-tz" defaultValue={activeOrganization?.timeZone ?? 'America/New_York'} />
          </Field>
        </CardContent>
        <CardFooter className="justify-end gap-2 border-t pt-4">
          <Button variant="outline">Cancel</Button>
          <Button>Save changes</Button>
        </CardFooter>
      </Card>

      <Card className="border-destructive/40">
        <CardHeader>
          <CardTitle className="text-base text-destructive">Danger zone</CardTitle>
          <CardDescription>Irreversible and destructive actions.</CardDescription>
        </CardHeader>
        <CardFooter className="justify-between border-t pt-4">
          <span className="text-sm text-muted-foreground">Delete this organization and all its data.</span>
          <Button variant="destructive">Delete organization</Button>
        </CardFooter>
      </Card>
    </div>
  );
}
