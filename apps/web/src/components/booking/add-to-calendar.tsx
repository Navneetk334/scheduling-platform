'use client';

import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@invincible/ui';
import { CalendarPlus } from 'lucide-react';
import * as React from 'react';

import {
  type CalendarEvent,
  googleCalendarUrl,
  icsDataUri,
  outlookCalendarUrl,
} from '@/lib/calendar-links';

export function AddToCalendar({ event, className }: { event: CalendarEvent; className?: string }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className={className}>
          <CalendarPlus className="size-4" aria-hidden /> Add to calendar
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="center">
        <DropdownMenuItem asChild>
          <a href={googleCalendarUrl(event)} target="_blank" rel="noreferrer">
            Google Calendar
          </a>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <a href={outlookCalendarUrl(event)} target="_blank" rel="noreferrer">
            Outlook
          </a>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <a href={icsDataUri(event)} download="invincible-pros-booking.ics">
            Apple / iCal (.ics)
          </a>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
