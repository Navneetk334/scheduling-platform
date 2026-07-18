'use client';

import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Skeleton,
} from '@invincible/ui';
import Link from 'next/link';
import * as React from 'react';

import { useMeetingTypes } from '@/hooks/use-meeting-types';
import { useActiveOrganization } from '@/hooks/use-organizations';

export default function DashboardOverviewPage() {
  const { activeOrganization, isLoading } = useActiveOrganization();
  const meetingTypes = useMeetingTypes(activeOrganization?.id);

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Overview</h1>
        <p className="text-sm text-muted-foreground">
          {isLoading
            ? 'Loading your organization…'
            : activeOrganization
              ? `Workspace: ${activeOrganization.name}`
              : 'No organization yet.'}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Active meeting types</CardDescription>
            <CardTitle className="text-3xl">
              {meetingTypes.isLoading ? (
                <Skeleton className="h-8 w-12" />
              ) : (
                (meetingTypes.data?.length ?? 0)
              )}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Your role</CardDescription>
            <CardTitle className="text-3xl capitalize">
              {activeOrganization?.role.toLowerCase() ?? '—'}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Booking link</CardDescription>
            <CardTitle className="truncate text-base">
              /{activeOrganization?.slug ?? 'your-org'}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Get started</CardTitle>
          <CardDescription>Create an meeting type so people can book time with you.</CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild>
            <Link href="/dashboard/meeting-types">Manage meeting types</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
