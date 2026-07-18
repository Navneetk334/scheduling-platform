import { Badge, type BadgeProps } from '@invincible/ui';
import * as React from 'react';

const VARIANT_BY_STATUS: Record<string, NonNullable<BadgeProps['variant']>> = {
  // bookings
  CONFIRMED: 'success',
  PENDING: 'warning',
  CANCELLED: 'destructive',
  RESCHEDULED: 'secondary',
  COMPLETED: 'success',
  NO_SHOW: 'destructive',
  // billing
  PAID: 'success',
  OPEN: 'warning',
  VOID: 'secondary',
  FAILED: 'destructive',
  REFUNDED: 'secondary',
  SUCCEEDED: 'success',
  // generic
  ACTIVE: 'success',
  INACTIVE: 'secondary',
  CONNECTED: 'success',
  DISCONNECTED: 'secondary',
  ERROR: 'destructive',
  PAUSED: 'warning',
};

export function StatusBadge({ status }: { status: string }) {
  const variant = VARIANT_BY_STATUS[status.toUpperCase()] ?? 'secondary';
  const label = status.replace(/_/g, ' ').toLowerCase();
  return <Badge variant={variant} className="capitalize">{label}</Badge>;
}
