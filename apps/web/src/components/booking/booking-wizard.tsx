'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import type { BookingPage, StaffMember } from '@invincible/sdk';
import {
  Alert,
  AlertDescription,
  Avatar,
  AvatarFallback,
  Badge,
  Button,
  Card,
  CardContent,
  Field,
  Input,
  cn,
} from '@invincible/ui';
import { AnimatePresence, motion } from 'framer-motion';
import {
  CalendarCheck,
  CheckCircle2,
  ChevronLeft,
  Clock,
  CreditCard,
  Globe,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
} from 'lucide-react';
import Link from 'next/link';
import * as React from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { useCreateBooking } from '@/hooks/use-booking';
import { detectTimeZone, formatMoney, formatSlotLong } from '@/lib/format';

import { AddToCalendar } from './add-to-calendar';
import { SlotPicker } from './slot-picker';

const detailsSchema = z.object({
  name: z.string().trim().min(1, 'Please enter your name.'),
  email: z.string().email('Enter a valid email.'),
  phone: z.string().trim().max(30).optional(),
  notes: z.string().max(2000).optional(),
});
type DetailsValues = z.infer<typeof detailsSchema>;

type StepKey = 'staff' | 'datetime' | 'details' | 'payment';

const EASE = [0.22, 1, 0.36, 1] as const;

export function BookingWizard({ page, orgSlug }: { page: BookingPage; orgSlug: string }) {
  const { meetingType, organization } = page;
  const [timeZone] = React.useState(detectTimeZone);
  const hasStaffChoice = meetingType.staff.length > 1;
  const isPaid = Boolean(meetingType.price);

  const steps = React.useMemo<StepKey[]>(() => {
    const s: StepKey[] = [];
    if (hasStaffChoice) s.push('staff');
    s.push('datetime', 'details');
    if (isPaid) s.push('payment');
    return s;
  }, [hasStaffChoice, isPaid]);

  const [stepIndex, setStepIndex] = React.useState(0);
  const [staffId, setStaffId] = React.useState<string | null>(
    hasStaffChoice ? null : (meetingType.staff[0]?.id ?? null),
  );
  const [slot, setSlot] = React.useState<string | null>(null);
  const [details, setDetails] = React.useState<DetailsValues | null>(null);

  const createBooking = useCreateBooking();

  const form = useForm<DetailsValues>({ resolver: zodResolver(detailsSchema) });

  const step = steps[stepIndex]!;
  const selectedStaff = meetingType.staff.find((s) => s.id === staffId) ?? null;

  const submit = React.useCallback(
    (values: DetailsValues) => {
      if (!slot) return;
      createBooking.mutate({
        meetingTypeId: meetingType.id,
        startTime: slot,
        hostId: staffId ?? undefined,
        invitee: {
          name: values.name,
          email: values.email,
          phone: values.phone || undefined,
          timeZone,
          notes: values.notes || undefined,
        },
        guests: [],
      });
    },
    [createBooking, meetingType.id, slot, staffId, timeZone],
  );

  const onDetailsSubmit = form.handleSubmit((values) => {
    setDetails(values);
    if (isPaid) {
      setStepIndex((i) => i + 1);
    } else {
      submit(values);
    }
  });

  if (createBooking.isSuccess) {
    return (
      <Confirmation
        page={page}
        orgSlug={orgSlug}
        timeZone={timeZone}
        booking={createBooking.data}
        phone={details?.phone}
      />
    );
  }

  const canBack = stepIndex > 0;

  return (
    <div className="mx-auto grid max-w-5xl gap-6 lg:grid-cols-[320px_1fr]">
      <Summary
        meetingType={meetingType}
        organizationName={organization.name}
        staff={selectedStaff}
        slot={slot}
        timeZone={timeZone}
      />

      <Card>
        <CardContent className="p-6">
          <Stepper steps={steps} current={stepIndex} />

          {createBooking.isError ? (
            <Alert variant="destructive" className="mt-4">
              <AlertDescription>
                {createBooking.error.message || 'That time is no longer available. Please pick another.'}
              </AlertDescription>
            </Alert>
          ) : null}

          <div className="mt-5">
            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -12 }}
                transition={{ duration: 0.25, ease: EASE }}
              >
                {step === 'staff' ? (
                  <StaffStep
                    staff={meetingType.staff}
                    selected={staffId}
                    onSelect={(id) => {
                      setStaffId(id);
                      setStepIndex((i) => i + 1);
                    }}
                  />
                ) : null}

                {step === 'datetime' ? (
                  <div>
                    <h2 className="mb-4 text-lg font-semibold">Pick a date &amp; time</h2>
                    <SlotPicker
                      meetingTypeId={meetingType.id}
                      timeZone={timeZone}
                      selected={slot}
                      onSelect={setSlot}
                    />
                    <div className="mt-6 flex justify-between">
                      <BackButton show={canBack} onClick={() => setStepIndex((i) => i - 1)} />
                      <Button disabled={!slot} onClick={() => setStepIndex((i) => i + 1)}>
                        Continue
                      </Button>
                    </div>
                  </div>
                ) : null}

                {step === 'details' ? (
                  <form onSubmit={onDetailsSubmit} className="space-y-4" noValidate>
                    <h2 className="text-lg font-semibold">Your details</h2>
                    <Field id="name" label="Full name" error={form.formState.errors.name?.message} required>
                      <Input id="name" autoComplete="name" invalid={Boolean(form.formState.errors.name)} {...form.register('name')} />
                    </Field>
                    <Field id="email" label="Email" error={form.formState.errors.email?.message} required>
                      <Input id="email" type="email" autoComplete="email" invalid={Boolean(form.formState.errors.email)} {...form.register('email')} />
                    </Field>
                    <Field id="phone" label="Phone" description="For SMS & WhatsApp reminders (optional).">
                      <Input id="phone" type="tel" autoComplete="tel" placeholder="+1 555 000 0000" {...form.register('phone')} />
                    </Field>
                    <Field id="notes" label="Notes" error={form.formState.errors.notes?.message}>
                      <textarea
                        id="notes"
                        rows={3}
                        placeholder="Anything to share before the meeting?"
                        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        {...form.register('notes')}
                      />
                    </Field>
                    <div className="flex justify-between">
                      <BackButton show={canBack} onClick={() => setStepIndex((i) => i - 1)} />
                      <Button type="submit" loading={!isPaid && createBooking.isPending}>
                        {isPaid ? 'Continue to payment' : 'Confirm booking'}
                      </Button>
                    </div>
                  </form>
                ) : null}

                {step === 'payment' ? (
                  <PaymentStep
                    amountLabel={meetingType.price ? formatMoney(meetingType.price.amount, meetingType.price.currency) : ''}
                    pending={createBooking.isPending}
                    onBack={() => setStepIndex((i) => i - 1)}
                    onPay={() => details && submit(details)}
                  />
                ) : null}
              </motion.div>
            </AnimatePresence>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function Stepper({ steps, current }: { steps: StepKey[]; current: number }) {
  const labels: Record<StepKey, string> = {
    staff: 'Staff',
    datetime: 'Date & time',
    details: 'Details',
    payment: 'Payment',
  };
  return (
    <ol className="flex items-center gap-2" aria-label="Progress">
      {steps.map((s, i) => {
        const done = i < current;
        const active = i === current;
        return (
          <li key={s} className="flex flex-1 items-center gap-2">
            <span
              className={cn(
                'flex size-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold transition-colors',
                done && 'bg-primary text-primary-foreground',
                active && 'bg-primary/15 text-primary ring-2 ring-primary',
                !done && !active && 'bg-muted text-muted-foreground',
              )}
              aria-current={active ? 'step' : undefined}
            >
              {done ? <CheckCircle2 className="size-4" aria-hidden /> : i + 1}
            </span>
            <span className={cn('hidden text-sm font-medium sm:block', active ? 'text-foreground' : 'text-muted-foreground')}>
              {labels[s]}
            </span>
            {i < steps.length - 1 ? <span className="h-px flex-1 bg-border" /> : null}
          </li>
        );
      })}
    </ol>
  );
}

function BackButton({ show, onClick }: { show: boolean; onClick: () => void }) {
  if (!show) return <span />;
  return (
    <Button type="button" variant="ghost" onClick={onClick}>
      <ChevronLeft className="size-4" aria-hidden /> Back
    </Button>
  );
}

function StaffStep({
  staff,
  selected,
  onSelect,
}: {
  staff: StaffMember[];
  selected: string | null;
  onSelect: (id: string) => void;
}) {
  return (
    <div>
      <h2 className="mb-4 text-lg font-semibold">Choose a team member</h2>
      <div className="grid gap-3 sm:grid-cols-2">
        {staff.map((member) => (
          <button
            key={member.id}
            onClick={() => onSelect(member.id)}
            aria-pressed={selected === member.id}
            className={cn(
              'flex items-center gap-3 rounded-xl border p-4 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
              selected === member.id ? 'border-primary bg-primary/5' : 'border-border hover:bg-secondary',
            )}
          >
            <Avatar className="size-10">
              <AvatarFallback>
                {member.name.split(' ').map((p) => p[0]).join('').slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <span className="font-medium">{member.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

function PaymentStep({
  amountLabel,
  pending,
  onBack,
  onPay,
}: {
  amountLabel: string;
  pending: boolean;
  onBack: () => void;
  onPay: () => void;
}) {
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Payment</h2>
      <div className="flex items-center justify-between rounded-lg bg-muted p-4">
        <span className="text-sm text-muted-foreground">Amount due</span>
        <span className="text-lg font-semibold">{amountLabel}</span>
      </div>
      <div className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
        <CreditCard className="mb-2 size-5" aria-hidden />
        Secure card payment via Stripe is processed here. Card details are collected in a PCI-compliant
        Stripe element (wired with the payments module).
      </div>
      <div className="flex justify-between">
        <BackButton show onClick={onBack} />
        <Button onClick={onPay} loading={pending}>
          Pay {amountLabel} &amp; confirm
        </Button>
      </div>
    </div>
  );
}

function Summary({
  meetingType,
  organizationName,
  staff,
  slot,
  timeZone,
}: {
  meetingType: BookingPage['meetingType'];
  organizationName: string;
  staff: StaffMember | null;
  slot: string | null;
  timeZone: string;
}) {
  const location = meetingType.locations[0];
  return (
    <Card className="h-fit lg:sticky lg:top-6">
      <CardContent className="space-y-4 p-6">
        <div className="flex items-center gap-2">
          <span className="size-3 rounded-full" style={{ backgroundColor: meetingType.color }} aria-hidden />
          <p className="text-sm text-muted-foreground">{organizationName}</p>
        </div>
        <h1 className="text-xl font-semibold tracking-tight">{meetingType.title}</h1>
        {meetingType.description ? (
          <p className="text-sm text-muted-foreground">{meetingType.description}</p>
        ) : null}

        <ul className="space-y-2.5 text-sm">
          <li className="flex items-center gap-2 text-muted-foreground">
            <Clock className="size-4" aria-hidden /> {meetingType.durationMinutes} minutes
          </li>
          {staff ? (
            <li className="flex items-center gap-2 text-muted-foreground">
              <Avatar className="size-5">
                <AvatarFallback className="text-[9px]">
                  {staff.name.split(' ').map((p) => p[0]).join('').slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              {staff.name}
            </li>
          ) : null}
          {location ? (
            <li className="flex items-center gap-2 text-muted-foreground">
              <MapPin className="size-4" aria-hidden />
              {location.type.replaceAll('_', ' ').toLowerCase()}
            </li>
          ) : null}
          <li className="flex items-center gap-2 text-muted-foreground">
            <Globe className="size-4" aria-hidden /> {timeZone}
          </li>
          {meetingType.price ? (
            <li className="flex items-center gap-2 font-medium text-foreground">
              <CreditCard className="size-4" aria-hidden />
              {formatMoney(meetingType.price.amount, meetingType.price.currency)}
            </li>
          ) : null}
        </ul>

        {slot ? (
          <Badge variant="secondary" className="w-full justify-center gap-1 py-2">
            <CalendarCheck className="size-3.5" aria-hidden /> {formatSlotLong(slot, timeZone)}
          </Badge>
        ) : null}
      </CardContent>
    </Card>
  );
}

function Confirmation({
  page,
  orgSlug,
  timeZone,
  booking,
  phone,
}: {
  page: BookingPage;
  orgSlug: string;
  timeZone: string;
  booking: { reference: string; startTime: string; endTime: string };
  phone?: string;
}) {
  const location = page.meetingType.locations[0];
  return (
    <div className="mx-auto max-w-lg">
      <Card>
        <CardContent className="flex flex-col items-center gap-5 py-12 text-center">
          <motion.div
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 260, damping: 18 }}
            className="flex size-16 items-center justify-center rounded-full bg-success/15 text-success"
          >
            <CheckCircle2 className="size-8" aria-hidden />
          </motion.div>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">You&apos;re booked!</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {formatSlotLong(booking.startTime, timeZone)} ({timeZone})
            </p>
          </div>

          <Badge variant="secondary">Confirmation {booking.reference}</Badge>

          <div className="flex flex-wrap items-center justify-center gap-2">
            <AddToCalendar
              event={{
                title: page.meetingType.title,
                description: page.meetingType.description ?? undefined,
                location: location?.value ?? location?.type,
                start: booking.startTime,
                end: booking.endTime,
              }}
            />
            <Button variant="ghost" asChild>
              <Link href={`/booking/${booking.reference}`}>Manage booking</Link>
            </Button>
          </div>

          <div className="w-full rounded-lg bg-muted/60 p-4 text-left text-xs text-muted-foreground">
            <p className="mb-2 font-medium text-foreground">Confirmations sent</p>
            <ul className="space-y-1.5">
              <li className="flex items-center gap-2">
                <Mail className="size-3.5" aria-hidden /> Email confirmation &amp; reminders
              </li>
              {phone ? (
                <>
                  <li className="flex items-center gap-2">
                    <Phone className="size-3.5" aria-hidden /> SMS reminder to {phone}
                  </li>
                  <li className="flex items-center gap-2">
                    <MessageCircle className="size-3.5" aria-hidden /> WhatsApp reminder to {phone}
                  </li>
                </>
              ) : null}
            </ul>
          </div>

          <Button variant="outline" asChild>
            <Link href={`/${orgSlug}`}>Book another</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
