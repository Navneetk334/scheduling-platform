'use client';

import {
  Alert,
  AlertDescription,
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Skeleton,
} from '@invincible/ui';
import { Clock, ExternalLink, Plus, Ticket } from 'lucide-react';
import * as React from 'react';

import { EmptyState } from '@/components/dashboard/empty-state';
import { FadeItem, Stagger } from '@/components/dashboard/motion';
import { PageHeader } from '@/components/dashboard/page-header';
import { useMeetingTypes } from '@/hooks/use-meeting-types';
import { useActiveOrganization } from '@/hooks/use-organizations';

export default function MeetingTypesPage() {
  const { activeOrganization } = useActiveOrganization();
  const { data, isLoading, isError, error } = useMeetingTypes(activeOrganization?.id);

  return (
    <div>
      <PageHeader
        title="Meeting Types"
        description="Bookable meeting types people can schedule with you."
        actions={
          <Button size="sm">
            <Plus className="size-4" /> New meeting type
          </Button>
        }
      />

      {isError ? (
        <Alert variant="destructive" className="mb-4">
          <AlertDescription>{(error as Error)?.message ?? 'Failed to load meeting types.'}</AlertDescription>
        </Alert>
      ) : null}

      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-5 w-40" />
                <Skeleton className="h-4 w-full" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-24" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : data && data.length > 0 ? (
        <Stagger className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {data.map((mt) => (
            <FadeItem key={mt.id}>
              <Card className="group h-full transition-shadow hover:shadow-md">
                <CardHeader>
                  <div className="flex items-center justify-between gap-2">
                    <CardTitle className="text-base">{mt.title}</CardTitle>
                    <span className="size-3 shrink-0 rounded-full" style={{ backgroundColor: mt.color }} aria-hidden />
                  </div>
                  {mt.description ? (
                    <CardDescription className="line-clamp-2">{mt.description}</CardDescription>
                  ) : null}
                </CardHeader>
                <CardContent className="flex items-center justify-between">
                  <Badge variant="secondary" className="gap-1">
                    <Clock className="size-3" aria-hidden /> {mt.durationMinutes} min
                  </Badge>
                  <Button variant="ghost" size="sm" asChild>
                    <a href={`/${activeOrganization?.slug}/${mt.slug}`} target="_blank" rel="noreferrer">
                      View page <ExternalLink className="size-3.5" aria-hidden />
                    </a>
                  </Button>
                </CardContent>
              </Card>
            </FadeItem>
          ))}
        </Stagger>
      ) : (
        <EmptyState
          icon={Ticket}
          title="No meeting types yet"
          description="Create your first meeting type to start accepting bookings."
          action={
            <Button>
              <Plus className="size-4" /> New meeting type
            </Button>
          }
        />
      )}
    </div>
  );
}
