'use client';

import { AlertTriangle, Gauge, Timer, Webhook } from 'lucide-react';
import * as React from 'react';

import { MetricPage } from '@/components/admin/metric-page';

export default function ApiUsagePage() {
  return (
    <MetricPage
      title="API Usage"
      description="Request volume, latency, and error rates."
      stats={[
        { label: 'Requests (30d)', value: '84.2M', icon: Gauge, delta: 11.0, trend: [60, 65, 70, 74, 78, 81, 84] },
        { label: 'p95 latency', value: '128 ms', icon: Timer, delta: -6.2, trend: [160, 152, 146, 140, 134, 130, 128] },
        { label: 'Error rate', value: '0.14%', icon: AlertTriangle, delta: -0.3, trend: [0.3, 0.28, 0.24, 0.2, 0.18, 0.15, 0.14] },
        { label: 'Webhook events', value: '2.1M', icon: Webhook, delta: 8.4, trend: [1.4, 1.5, 1.7, 1.8, 1.9, 2.0, 2.1] },
      ]}
      chart={{
        title: 'Requests by day (millions)',
        data: [
          { label: 'Mon', value: 2.7 }, { label: 'Tue', value: 3.1 }, { label: 'Wed', value: 3.4 },
          { label: 'Thu', value: 3.0 }, { label: 'Fri', value: 3.2 }, { label: 'Sat', value: 1.4 },
          { label: 'Sun', value: 1.1 },
        ],
      }}
    />
  );
}
