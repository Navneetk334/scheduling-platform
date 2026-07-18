'use client';

import { Activity, Database, HardDrive, Timer } from 'lucide-react';
import * as React from 'react';

import { MetricPage } from '@/components/admin/metric-page';

export default function DatabaseStatusPage() {
  return (
    <MetricPage
      title="Database Status"
      description="PostgreSQL primary + replica health."
      stats={[
        { label: 'Connections', value: '84 / 200', icon: Activity, delta: 2.1, trend: [70, 74, 76, 79, 81, 83, 84] },
        { label: 'Replication lag', value: '12 ms', icon: Timer, delta: -1.4, trend: [20, 18, 16, 15, 14, 13, 12] },
        { label: 'Database size', value: '186 GB', icon: Database, delta: 3.0, trend: [160, 166, 170, 175, 180, 184, 186] },
        { label: 'Disk free', value: '61%', icon: HardDrive, delta: -0.8, trend: [66, 65, 64, 63, 62, 61, 61] },
      ]}
      chart={{
        title: 'Query throughput (k/s)',
        data: [
          { label: 'Mon', value: 42 }, { label: 'Tue', value: 48 }, { label: 'Wed', value: 51 },
          { label: 'Thu', value: 47 }, { label: 'Fri', value: 49 }, { label: 'Sat', value: 22 },
          { label: 'Sun', value: 18 },
        ],
      }}
    />
  );
}
