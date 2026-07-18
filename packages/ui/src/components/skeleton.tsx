import * as React from 'react';

import { cn } from '../lib/cn';

/** Content placeholder shown while data loads. */
export function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('animate-pulse rounded-md bg-muted', className)} {...props} />;
}
