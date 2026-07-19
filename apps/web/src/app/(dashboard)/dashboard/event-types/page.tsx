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
import { Clock, ExternalLink } from 'lucide-react';
import * as React from 'react';

import { useEventTypes } from '@/hooks/use-event-types';
import { useActiveOrganization } from '@/hooks/use-organizations';

export default function EventTypesPage() {
  const { activeOrganization } = useActiveOrganization();
  const { data, isLoading, isError, error } = useEventTypes(activeOrganization?.id);

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Event Types</h1>
          <p className="text-sm text-muted-foreground">
            Bookable meeting types people can schedule with you.
          </p>
        </div>
      </div>

      {isError ? (
        <Alert variant="destructive">
          <AlertDescription>
            {(error)?.message ?? 'Failed to load event types.'}
          </AlertDescription>
        </Alert>
      ) : null}

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {[0, 1, 2, 3].map((i) => (
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
        <div className="grid gap-4 sm:grid-cols-2">
          {data.map((eventType) => {
            return (
              <Card key={eventType.id}>
                <CardHeader>
                  <div className="flex items-center justify-between gap-2">
                    <CardTitle className="text-base">{eventType.title}</CardTitle>
                    <span
                      className="size-3 shrink-0 rounded-full"
                      style={{ backgroundColor: eventType.color }}
                      aria-hidden
                    />
                  </div>
                  {eventType.description ? (
                    <CardDescription className="line-clamp-2">
                      {eventType.description}
                    </CardDescription>
                  ) : null}
                </CardHeader>
                <CardContent className="flex items-center justify-between">
                  <Badge variant="secondary" className="gap-1">
                    <Clock className="size-3" aria-hidden />
                    {eventType.durationMinutes} min
                  </Badge>
                  <Button variant="ghost" size="sm" asChild>
                    <a href={`/${activeOrganization?.slug}/${eventType.slug}`} target="_blank" rel="noreferrer">
                      View page
                      <ExternalLink className="size-3.5" aria-hidden />
                    </a>
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center gap-3 py-16 text-center">
            <div className="flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Clock className="size-6" aria-hidden />
            </div>
            <div>
              <p className="font-medium">No event types yet</p>
              <p className="text-sm text-muted-foreground">
                Create your first event type to start accepting bookings.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
