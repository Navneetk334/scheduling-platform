'use client';

import { ArrowDownToLine, ArrowUpFromLine, Signal, Zap } from 'lucide-react';
import * as React from 'react';

import { MetricPage } from '@/components/admin/metric-page';

export default function BandwidthUsagePage() {
  return (
    <MetricPage
      title="Bandwidth Usage"
      description="Egress and ingress across the platform edge."
      stats={[
        { label: 'Egress (30d)', value: '38 TB', icon: ArrowUpFromLine, delta: 7.2, trend: [30, 32, 33, 35, 36, 37, 38] },
        { label: 'Ingress (30d)', value: '12 TB', icon: ArrowDownToLine, delta: 3.1, trend: [9, 10, 10, 11, 11, 12, 12] },
        { label: 'Peak throughput', value: '4.1 Gbps', icon: Zap, delta: 5.0, trend: [3.2, 3.4, 3.6, 3.8, 3.9, 4.0, 4.1] },
        { label: 'CDN hit rate', value: '94%', icon: Signal, delta: 1.1, trend: [90, 91, 92, 93, 93, 94, 94] },
      ]}
      chart={{
        title: 'Egress by month',
        description: 'Terabytes',
        data: [
          { label: 'Jan', value: 30 }, { label: 'Feb', value: 32 }, { label: 'Mar', value: 33 },
          { label: 'Apr', value: 35 }, { label: 'May', value: 36 }, { label: 'Jun', value: 37 },
          { label: 'Jul', value: 38 },
        ],
      }}
    />
  );
}
