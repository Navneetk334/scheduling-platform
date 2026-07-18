'use client';

import { Building2, LogOut, UserPlus, Users } from 'lucide-react';
import * as React from 'react';

import { MetricPage } from '@/components/admin/metric-page';

export default function GrowthAnalyticsPage() {
  return (
    <MetricPage
      title="Growth Analytics"
      description="Signups, activation, and net growth."
      stats={[
        { label: 'New signups (30d)', value: '2,410', icon: UserPlus, delta: 9.7, trend: [30, 33, 36, 40, 43, 46, 48] },
        { label: 'New organizations', value: '318', icon: Building2, delta: 6.4, trend: [22, 24, 26, 28, 30, 31, 32] },
        { label: 'Active users', value: '18,902', icon: Users, delta: 4.2, trend: [15, 16, 16, 17, 18, 18, 19] },
        { label: 'Cancellations', value: '164', icon: LogOut, delta: -2.1, trend: [20, 19, 18, 18, 17, 16, 16] },
      ]}
      chart={{
        title: 'Net new organizations',
        data: [
          { label: 'Jan', value: 210 }, { label: 'Feb', value: 240 }, { label: 'Mar', value: 268 },
          { label: 'Apr', value: 280 }, { label: 'May', value: 300 }, { label: 'Jun', value: 312 },
          { label: 'Jul', value: 318 },
        ],
      }}
    />
  );
}
