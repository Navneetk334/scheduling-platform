'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import type { BookingPage } from '@invincible/sdk';
import {
  Alert,
  AlertDescription,
  AlertTitle,
  Avatar,
  AvatarFallback,
  Badge,
  Button,
  Card,
  CardContent,
  Field,
  Input,
  Skeleton,
  cn,
} from '@invincible/ui';
import { CalendarCheck, Clock, Globe, Video } from 'lucide-react';
import * as React from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { useAvailability, useCreateBooking } from '@/hooks/use-booking';
import { addDays, calendarDate, detectTimeZone, formatDateHeading, formatTime, todayInZone } from '@/lib/format';

const WINDOW_DAYS = 14;

const inviteeSchema = z.object({
  name: z.string().min(1, 'Please enter your name.'),
  email: z.string().email('Enter a valid email.'),
  notes: z.string().max(2000).optional(),
});
type InviteeValues = z.infer<typeof inviteeSchema>;

export function BookingExperience({ page }: { page: BookingPage }) {
  const [timeZone] = React.useState(detectTimeZone);
  const [selectedSlot, setSelectedSlot] = React.useState<string | null>(null);
  const today = todayInZone(timeZone);

  const availability = useAvailability({
    eventTypeId: page.eventType.id,
    from: today,
    to: addDays(today, WINDOW_DAYS),
    timeZone,
  });
  const createBooking = useCreateBooking();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<InviteeValues>({ resolver: zodResolver(inviteeSchema) });

  // Group slots by local calendar date for display.
  const slotsByDate = React.useMemo(() => {
    const grouped = new Map<string, { start: string; label: string }[]>();
    for (const slot of availability.data ?? []) {
      const key = calendarDate(slot.start, timeZone);
      const list = grouped.get(key) ?? [];
      list.push({ start: slot.start, label: formatTime(slot.start, timeZone) });
      grouped.set(key, list);
    }
    return grouped;
  }, [availability.data, timeZone]);

  const onSubmit = handleSubmit((values) => {
    if (!selectedSlot) return;
    createBooking.mutate({
      eventTypeId: page.eventType.id,
      startTime: selectedSlot,
      invitee: { name: values.name, email: values.email, timeZone, notes: values.notes },
      guests: [],
    });
  });

  if (createBooking.isSuccess) {
    return <Confirmation booking={createBooking.data} timeZone={timeZone} />;
  }

  return (
    <div className="mx-auto grid max-w-5xl gap-6 md:grid-cols-[320px_1fr]">
      {/* Event summary */}
      <Card className="h-fit">
        <CardContent className="space-y-4 p-6">
          <div className="flex items-center gap-3">
            <Avatar>
              <AvatarFallback>
                {page.eventType.host.name.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm text-muted-foreground">{page.organization.name}</p>
              <p className="font-medium">{page.eventType.host.name}</p>
            </div>
          </div>
          <h1 className="text-xl font-semibold tracking-tight">{page.eventType.title}</h1>
          {page.eventType.description ? (
            <p className="text-sm text-muted-foreground">{page.eventType.description}</p>
          ) : null}
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-center gap-2">
              <Clock className="size-4" aria-hidden /> {page.eventType.durationMinutes} minutes
            </li>
            {page.eventType.locations[0] ? (
              <li className="flex items-center gap-2">
                <Video className="size-4" aria-hidden />
                {page.eventType.locations[0].type.replaceAll('_', ' ').toLowerCase()}
              </li>
            ) : null}
            <li className="flex items-center gap-2">
              <Globe className="size-4" aria-hidden /> {timeZone}
            </li>
          </ul>
        </CardContent>
      </Card>

      {/* Slot picker + form */}
      <Card>
        <CardContent className="p-6">
          {!selectedSlot ? (
            <SlotPicker
              isLoading={availability.isLoading}
              isError={availability.isError}
              slotsByDate={slotsByDate}
              onSelect={setSelectedSlot}
            />
          ) : (
            <form onSubmit={(event) => void onSubmit(event)} className="space-y-4" noValidate>
              <div className="flex items-center justify-between">
                <Badge variant="secondary" className="gap-1">
                  <CalendarCheck className="size-3" aria-hidden />
                  {formatDateHeading(calendarDate(selectedSlot, timeZone))} ·{' '}
                  {formatTime(selectedSlot, timeZone)}
                </Badge>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedSlot(null)}
                >
                  Change
                </Button>
              </div>

              {createBooking.isError ? (
                <Alert variant="destructive">
                  <AlertDescription>
                    {createBooking.error.message || 'That time is no longer available.'}
                  </AlertDescription>
                </Alert>
              ) : null}

              <Field id="name" label="Your name" error={errors.name?.message} required>
                <Input id="name" invalid={Boolean(errors.name)} {...register('name')} />
              </Field>
              <Field id="email" label="Email" error={errors.email?.message} required>
                <Input id="email" type="email" invalid={Boolean(errors.email)} {...register('email')} />
              </Field>
              <Field id="notes" label="Notes" error={errors.notes?.message}>
                <Input id="notes" placeholder="Anything to share before the meeting?" {...register('notes')} />
              </Field>

              <Button type="submit" className="w-full" loading={createBooking.isPending}>
                Confirm booking
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function SlotPicker({
  isLoading,
  isError,
  slotsByDate,
  onSelect,
}: {
  isLoading: boolean;
  isError: boolean;
  slotsByDate: Map<string, { start: string; label: string }[]>;
  onSelect: (start: string) => void;
}) {
  if (isLoading) {
    return (
      <div className="space-y-3">
        {[0, 1, 2].map((i) => (
          <Skeleton key={i} className="h-10 w-full" />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <Alert variant="destructive">
        <AlertTitle>Couldn&apos;t load availability</AlertTitle>
        <AlertDescription>Please refresh and try again.</AlertDescription>
      </Alert>
    );
  }

  const dates = [...slotsByDate.keys()].sort();
  if (dates.length === 0) {
    return (
      <div className="py-16 text-center text-sm text-muted-foreground">
        No open times in the next two weeks. Please check back later.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {dates.map((dateKey) => (
        <div key={dateKey}>
          <h2 className="mb-2 text-sm font-medium text-foreground">
            {formatDateHeading(dateKey)}
          </h2>
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
            {slotsByDate.get(dateKey)!.map((slot) => (
              <button
                key={slot.start}
                type="button"
                onClick={() => onSelect(slot.start)}
                className={cn(
                  'rounded-md border border-input bg-background px-2 py-2 text-sm font-medium transition-colors',
                  'hover:border-primary hover:bg-primary/5 hover:text-primary',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                )}
              >
                {slot.label}
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function Confirmation({
  booking,
  timeZone,
}: {
  booking: { reference: string; startTime: string };
  timeZone: string;
}) {
  return (
    <div className="mx-auto max-w-md">
      <Card>
        <CardContent className="flex flex-col items-center gap-4 py-12 text-center">
          <div className="flex size-14 items-center justify-center rounded-full bg-success/15 text-success">
            <CalendarCheck className="size-7" aria-hidden />
          </div>
          <div>
            <h1 className="text-xl font-semibold">You&apos;re booked!</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {formatDateHeading(calendarDate(booking.startTime, timeZone))} at{' '}
              {formatTime(booking.startTime, timeZone)} ({timeZone})
            </p>
          </div>
          <Badge variant="secondary">Confirmation: {booking.reference}</Badge>
          <p className="text-xs text-muted-foreground">
            A confirmation has been sent to your email.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
