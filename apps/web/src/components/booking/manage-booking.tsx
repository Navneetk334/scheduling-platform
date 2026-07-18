'use client';

import {
  Alert,
  AlertDescription,
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Input,
  Separator,
  Spinner,
} from '@invincible/ui';
import { CalendarClock, CheckCircle2, Clock, MapPin, XCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import * as React from 'react';

import { useBooking, useCancelBooking, useRescheduleBooking } from '@/hooks/use-booking';
import { detectTimeZone, formatSlotLong } from '@/lib/format';

import { AddToCalendar } from './add-to-calendar';
import { SlotPicker } from './slot-picker';

export function ManageBooking({ reference }: { reference: string }) {
  const router = useRouter();
  const [viewerTz] = React.useState(detectTimeZone);
  const { data: booking, isLoading, isError, refetch } = useBooking(reference);

  const [mode, setMode] = React.useState<'view' | 'reschedule' | 'cancel'>('view');
  const [newSlot, setNewSlot] = React.useState<string | null>(null);
  const [reason, setReason] = React.useState('');

  const reschedule = useRescheduleBooking();
  const cancel = useCancelBooking();

  if (isLoading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Spinner label="Loading your booking" />
      </div>
    );
  }

  if (isError || !booking) {
    return (
      <Alert variant="destructive">
        <AlertDescription>We couldn&apos;t find a booking with reference {reference}.</AlertDescription>
      </Alert>
    );
  }

  const cancelled = booking.status === 'CANCELLED';
  const rescheduled = booking.status === 'RESCHEDULED';
  const location = booking.meetingType.locationLinks[0]?.location;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="text-lg">{booking.meetingType.title}</CardTitle>
          <Badge variant={cancelled ? 'destructive' : rescheduled ? 'secondary' : 'success'} className="capitalize">
            {booking.status.toLowerCase()}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li className="flex items-center gap-2">
            <CalendarClock className="size-4" aria-hidden /> {formatSlotLong(booking.startTime, viewerTz)} ({viewerTz})
          </li>
          <li className="flex items-center gap-2">
            <Clock className="size-4" aria-hidden /> {booking.meetingType.durationMinutes} minutes
          </li>
          {location ? (
            <li className="flex items-center gap-2">
              <MapPin className="size-4" aria-hidden /> {location.kind.replaceAll('_', ' ').toLowerCase()}
            </li>
          ) : null}
        </ul>

        <Badge variant="secondary">Confirmation {booking.reference}</Badge>

        {cancelled ? (
          <Alert variant="destructive">
            <AlertDescription>This booking has been cancelled.</AlertDescription>
          </Alert>
        ) : null}

        {!cancelled && mode === 'view' ? (
          <>
            <Separator />
            <div className="flex flex-wrap gap-2">
              <AddToCalendar
                event={{
                  title: booking.meetingType.title,
                  location: location?.value ?? location?.kind,
                  start: booking.startTime,
                  end: booking.endTime,
                }}
              />
              <Button variant="outline" onClick={() => setMode('reschedule')}>
                Reschedule
              </Button>
              <Button variant="ghost" className="text-destructive hover:text-destructive" onClick={() => setMode('cancel')}>
                Cancel booking
              </Button>
            </div>
          </>
        ) : null}

        {mode === 'reschedule' ? (
          <div className="space-y-4">
            <Separator />
            <h3 className="font-medium">Pick a new time</h3>
            {reschedule.isError ? (
              <Alert variant="destructive">
                <AlertDescription>{reschedule.error.message || 'That time is unavailable.'}</AlertDescription>
              </Alert>
            ) : null}
            <SlotPicker
              meetingTypeId={booking.meetingTypeId}
              timeZone={viewerTz}
              selected={newSlot}
              onSelect={setNewSlot}
            />
            <div className="flex justify-between">
              <Button variant="ghost" onClick={() => setMode('view')}>
                Back
              </Button>
              <Button
                disabled={!newSlot}
                loading={reschedule.isPending}
                onClick={() => {
                  if (!newSlot) return;
                  reschedule.mutate(
                    { reference, startTime: newSlot },
                    { onSuccess: (data) => router.push(`/booking/${data.reference}`) },
                  );
                }}
              >
                Confirm new time
              </Button>
            </div>
          </div>
        ) : null}

        {mode === 'cancel' ? (
          <div className="space-y-4">
            <Separator />
            <h3 className="font-medium">Cancel this booking?</h3>
            <Input
              placeholder="Reason (optional)"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              aria-label="Cancellation reason"
            />
            <div className="flex justify-between">
              <Button variant="ghost" onClick={() => setMode('view')}>
                Keep booking
              </Button>
              <Button
                variant="destructive"
                loading={cancel.isPending}
                onClick={() => {
                  cancel.mutate(
                    { reference, reason: reason || undefined },
                    {
                      onSuccess: () => {
                        setMode('view');
                        void refetch();
                      },
                    },
                  );
                }}
              >
                Cancel booking
              </Button>
            </div>
          </div>
        ) : null}

        {cancelled ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <XCircle className="size-4" aria-hidden /> No further action needed.
          </div>
        ) : mode === 'view' ? (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <CheckCircle2 className="size-3.5 text-success" aria-hidden /> A confirmation and reminders were sent to your email.
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
