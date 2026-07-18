'use client';

import { Button, Card, CardContent, cn } from '@invincible/ui';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import * as React from 'react';

import { PageHeader } from '@/components/dashboard/page-header';

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

// Mock event counts keyed by day-of-month.
const eventsByDay: Record<number, number> = { 3: 2, 8: 1, 12: 3, 15: 1, 19: 2, 21: 4, 22: 1, 27: 2 };

export default function CalendarPage() {
  const [cursor, setCursor] = React.useState(() => {
    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth(), today: now.getDate() };
  });

  const first = new Date(cursor.year, cursor.month, 1);
  const daysInMonth = new Date(cursor.year, cursor.month + 1, 0).getDate();
  const startWeekday = first.getDay();
  const monthLabel = first.toLocaleString('en-US', { month: 'long', year: 'numeric' });

  const cells: (number | null)[] = [
    ...Array.from({ length: startWeekday }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  const shift = (delta: number) =>
    setCursor((c) => {
      const d = new Date(c.year, c.month + delta, 1);
      return { year: d.getFullYear(), month: d.getMonth(), today: c.today };
    });

  return (
    <div>
      <PageHeader
        title="Calendar"
        description="A month view of your scheduled meetings."
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" aria-label="Previous month" onClick={() => shift(-1)}>
              <ChevronLeft className="size-4" />
            </Button>
            <span className="min-w-40 text-center text-sm font-medium">{monthLabel}</span>
            <Button variant="outline" size="icon" aria-label="Next month" onClick={() => shift(1)}>
              <ChevronRight className="size-4" />
            </Button>
          </div>
        }
      />

      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-7 gap-px">
            {WEEKDAYS.map((d) => (
              <div key={d} className="pb-2 text-center text-xs font-semibold text-muted-foreground">
                {d}
              </div>
            ))}
            {cells.map((day, i) => {
              const isToday = day === cursor.today;
              const count = day ? eventsByDay[day] : undefined;
              return (
                <div
                  key={i}
                  className={cn(
                    'min-h-24 rounded-lg border border-transparent p-2 text-sm',
                    day ? 'bg-muted/40 hover:border-border' : 'bg-transparent',
                  )}
                >
                  {day ? (
                    <>
                      <span
                        className={cn(
                          'inline-flex size-6 items-center justify-center rounded-full text-xs',
                          isToday ? 'bg-primary font-semibold text-primary-foreground' : 'text-foreground',
                        )}
                      >
                        {day}
                      </span>
                      {count ? (
                        <div className="mt-1 space-y-1">
                          {Array.from({ length: Math.min(count, 2) }).map((_, k) => (
                            <div key={k} className="truncate rounded bg-primary/15 px-1.5 py-0.5 text-[10px] font-medium text-primary">
                              Meeting
                            </div>
                          ))}
                          {count > 2 ? (
                            <div className="text-[10px] text-muted-foreground">+{count - 2} more</div>
                          ) : null}
                        </div>
                      ) : null}
                    </>
                  ) : null}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
