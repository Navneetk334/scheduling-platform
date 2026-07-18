'use client';

import { Alert, AlertDescription, Skeleton, cn } from '@invincible/ui';
import * as React from 'react';

import { useAvailability } from '@/hooks/use-booking';
import { addDays, calendarDate, formatDateHeading, formatTime, todayInZone } from '@/lib/format';

const WINDOW_DAYS = 21;

interface SlotPickerProps {
  meetingTypeId: string;
  timeZone: string;
  selected: string | null;
  onSelect: (iso: string) => void;
}

/**
 * Premium two-pane availability picker: a scrollable day rail plus a time grid
 * for the chosen day. Fully keyboard accessible; slots are radio-like.
 */
export function SlotPicker({ meetingTypeId, timeZone, selected, onSelect }: SlotPickerProps) {
  const today = todayInZone(timeZone);
  const { data, isLoading, isError } = useAvailability({
    meetingTypeId,
    from: today,
    to: addDays(today, WINDOW_DAYS),
    timeZone,
  });

  const slotsByDate = React.useMemo(() => {
    const grouped = new Map<string, { start: string; label: string }[]>();
    for (const slot of data ?? []) {
      const key = calendarDate(slot.start, timeZone);
      const list = grouped.get(key) ?? [];
      list.push({ start: slot.start, label: formatTime(slot.start, timeZone) });
      grouped.set(key, list);
    }
    return grouped;
  }, [data, timeZone]);

  const dates = React.useMemo(() => [...slotsByDate.keys()].sort(), [slotsByDate]);
  const [activeDate, setActiveDate] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!activeDate && dates.length > 0) setActiveDate(dates[0]!);
  }, [dates, activeDate]);

  if (isLoading) {
    return (
      <div className="grid gap-4 sm:grid-cols-[200px_1fr]">
        <div className="space-y-2">
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-11 w-full" />
          ))}
        </div>
        <div className="grid grid-cols-3 gap-2">
          {Array.from({ length: 9 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-full" />
          ))}
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <Alert variant="destructive">
        <AlertDescription>Couldn&apos;t load availability. Please refresh and try again.</AlertDescription>
      </Alert>
    );
  }

  if (dates.length === 0) {
    return (
      <div className="rounded-lg border border-dashed py-16 text-center text-sm text-muted-foreground">
        No open times in the next few weeks. Please check back later.
      </div>
    );
  }

  const times = activeDate ? (slotsByDate.get(activeDate) ?? []) : [];

  return (
    <div className="grid gap-5 sm:grid-cols-[210px_1fr]">
      <div
        className="flex gap-2 overflow-x-auto pb-2 sm:max-h-[340px] sm:flex-col sm:overflow-y-auto sm:pb-0"
        role="tablist"
        aria-label="Available dates"
      >
        {dates.map((dateKey) => {
          const active = dateKey === activeDate;
          return (
            <button
              key={dateKey}
              role="tab"
              aria-selected={active}
              onClick={() => setActiveDate(dateKey)}
              className={cn(
                'flex shrink-0 flex-col rounded-lg border px-3 py-2 text-left text-sm transition-colors sm:shrink',
                active ? 'border-primary bg-primary/5 text-primary' : 'border-border hover:bg-secondary',
              )}
            >
              <span className="font-medium">{formatDateHeading(dateKey)}</span>
              <span className="text-xs text-muted-foreground">
                {slotsByDate.get(dateKey)!.length} slots
              </span>
            </button>
          );
        })}
      </div>

      <div
        className="grid max-h-[340px] grid-cols-2 gap-2 overflow-y-auto sm:grid-cols-3"
        role="radiogroup"
        aria-label="Available times"
      >
        {times.map((slot) => {
          const active = selected === slot.start;
          return (
            <button
              key={slot.start}
              role="radio"
              aria-checked={active}
              onClick={() => onSelect(slot.start)}
              className={cn(
                'h-11 rounded-lg border text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                active
                  ? 'border-primary bg-primary text-primary-foreground'
                  : 'border-input hover:border-primary hover:bg-primary/5 hover:text-primary',
              )}
            >
              {slot.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
