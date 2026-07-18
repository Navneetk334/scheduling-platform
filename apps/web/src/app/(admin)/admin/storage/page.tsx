'use client';

import { Database, FileImage, HardDrive, Trash2 } from 'lucide-react';
import * as React from 'react';

import { MetricPage } from '@/components/admin/metric-page';

export default function StorageUsagePage() {
  return (
    <MetricPage
      title="Storage Usage"
      description="Object storage consumption across tenants."
      stats={[
        { label: 'Total stored', value: '4.2 TB', icon: HardDrive, delta: 6.1, trend: [3.4, 3.6, 3.7, 3.9, 4.0, 4.1, 4.2] },
        { label: 'Files', value: '1.9M', icon: FileImage, delta: 4.3, trend: [1.5, 1.6, 1.7, 1.8, 1.85, 1.9, 1.9] },
        { label: 'Avg / org', value: '3.3 GB', icon: Database, delta: 2.0, trend: [2.9, 3.0, 3.1, 3.2, 3.2, 3.3, 3.3] },
        { label: 'Reclaimable', value: '210 GB', icon: Trash2, delta: -1.5, trend: [260, 250, 240, 230, 220, 214, 210] },
      ]}
      chart={{
        title: 'Storage growth',
        description: 'Terabytes stored',
        data: [
          { label: 'Jan', value: 34 }, { label: 'Feb', value: 36 }, { label: 'Mar', value: 37 },
          { label: 'Apr', value: 39 }, { label: 'May', value: 40 }, { label: 'Jun', value: 41 },
          { label: 'Jul', value: 42 },
        ],
      }}
    />
  );
}
