'use client';

import { Button, Card, CardContent } from '@invincible/ui';
import { Clock, Video } from 'lucide-react';
import * as React from 'react';

import { FadeItem, Stagger } from '@/components/dashboard/motion';
import { PageHeader } from '@/components/dashboard/page-header';

interface Upcoming {
  id: string;
  invitee: string;
  type: string;
  date: string;
  time: string;
  location: string;
}

const groups: { label: string; items: Upcoming[] }[] = [
  {
    label: 'Today',
    items: [
      { id: '1', invitee: 'Ada Lovelace', type: 'Intro Call', date: 'Jul 21', time: '2:30 – 3:00 PM', location: 'Google Meet' },
      { id: '2', invitee: 'Alan Turing', type: 'Strategy Session', date: 'Jul 21', time: '4:00 – 4:45 PM', location: 'Zoom' },
    ],
  },
  {
    label: 'Tomorrow',
    items: [
      { id: '3', invitee: 'Grace Hopper', type: 'Product Demo', date: 'Jul 22', time: '10:00 – 10:30 AM', location: 'Google Meet' },
    ],
  },
];

export default function UpcomingPage() {
  return (
    <div>
      <PageHeader title="Upcoming" description="Your next meetings at a glance." />

      <div className="space-y-8">
        {groups.map((group) => (
          <div key={group.label}>
            <h3 className="mb-3 text-sm font-semibold text-muted-foreground">{group.label}</h3>
            <Stagger className="space-y-3">
              {group.items.map((item) => (
                <FadeItem key={item.id}>
                  <Card>
                    <CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex items-center gap-4">
                        <div className="flex size-12 flex-col items-center justify-center rounded-lg bg-primary/10 text-primary">
                          <span className="text-[10px] font-semibold uppercase">{item.date.split(' ')[0]}</span>
                          <span className="text-lg font-bold leading-none">{item.date.split(' ')[1]}</span>
                        </div>
                        <div>
                          <p className="font-medium">{item.invitee}</p>
                          <p className="text-sm text-muted-foreground">{item.type}</p>
                          <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
                            <span className="inline-flex items-center gap-1">
                              <Clock className="size-3" aria-hidden /> {item.time}
                            </span>
                            <span className="inline-flex items-center gap-1">
                              <Video className="size-3" aria-hidden /> {item.location}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">Reschedule</Button>
                        <Button size="sm">Join</Button>
                      </div>
                    </CardContent>
                  </Card>
                </FadeItem>
              ))}
            </Stagger>
          </div>
        ))}
      </div>
    </div>
  );
}
