'use client';

import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@invincible/ui';
import { CalendarCheck, DollarSign, TrendingUp, Users } from 'lucide-react';
import Link from 'next/link';
import * as React from 'react';

import { BarChart } from '@/components/dashboard/bar-chart';
import { FadeItem, Stagger } from '@/components/dashboard/motion';
import { StatCard } from '@/components/dashboard/stat-card';
import { StatusBadge } from '@/components/dashboard/status-badge';
import { useMeetingTypes } from '@/hooks/use-meeting-types';
import { useActiveOrganization } from '@/hooks/use-organizations';

const weekly = [
  { label: 'Mon', value: 18 },
  { label: 'Tue', value: 24 },
  { label: 'Wed', value: 31 },
  { label: 'Thu', value: 22 },
  { label: 'Fri', value: 28 },
  { label: 'Sat', value: 9 },
  { label: 'Sun', value: 6 },
];

const recent = [
  { name: 'Ada Lovelace', type: 'Intro Call', time: 'Today, 2:30 PM', status: 'CONFIRMED' },
  { name: 'Alan Turing', type: 'Strategy Session', time: 'Today, 4:00 PM', status: 'CONFIRMED' },
  { name: 'Grace Hopper', type: 'Demo', time: 'Tomorrow, 10:00 AM', status: 'PENDING' },
  { name: 'Katherine Johnson', type: 'Intro Call', time: 'Tomorrow, 1:15 PM', status: 'CONFIRMED' },
];

export default function DashboardOverviewPage() {
  const { activeOrganization } = useActiveOrganization();
  const meetingTypes = useMeetingTypes(activeOrganization?.id);

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-semibold tracking-tight">
          Welcome back{activeOrganization ? `, ${activeOrganization.name}` : ''}
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Here&apos;s what&apos;s happening across your workspace.
        </p>
      </div>

      <Stagger className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <FadeItem>
          <StatCard
            label="Bookings this month"
            value="342"
            icon={CalendarCheck}
            delta={12.4}
            trend={[12, 18, 15, 22, 20, 28, 34]}
          />
        </FadeItem>
        <FadeItem>
          <StatCard
            label="Revenue"
            value="$8,240"
            icon={DollarSign}
            delta={8.1}
            trend={[10, 12, 11, 15, 17, 16, 21]}
          />
        </FadeItem>
        <FadeItem>
          <StatCard
            label="Conversion"
            value="64%"
            icon={TrendingUp}
            delta={3.2}
            trend={[40, 44, 48, 52, 55, 60, 64]}
          />
        </FadeItem>
        <FadeItem>
          <StatCard
            label="Active meeting types"
            value={String(meetingTypes.data?.length ?? 0)}
            icon={Users}
            delta={-1.5}
            trend={[8, 7, 7, 6, 6, 5, 5]}
          />
        </FadeItem>
      </Stagger>

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Bookings this week</CardTitle>
            <CardDescription>Confirmed meetings per day</CardDescription>
          </CardHeader>
          <CardContent>
            <BarChart data={weekly} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <CardTitle>Recent bookings</CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/dashboard/bookings">View all</Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {recent.map((b) => (
              <div key={`${b.name}-${b.time}`} className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{b.name}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {b.type} · {b.time}
                  </p>
                </div>
                <StatusBadge status={b.status} />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
