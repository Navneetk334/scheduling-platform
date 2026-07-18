import { Loader2 } from 'lucide-react';
import * as React from 'react';

import { cn } from '../lib/cn';

export interface SpinnerProps extends React.HTMLAttributes<HTMLDivElement> {
  label?: string;
}

/** Accessible loading indicator (announces via visually-hidden label). */
export function Spinner({ className, label = 'Loading', ...props }: SpinnerProps) {
  return (
    <div role="status" className={cn('inline-flex items-center', className)} {...props}>
      <Loader2 className="size-5 animate-spin text-muted-foreground" aria-hidden />
      <span className="sr-only">{label}</span>
    </div>
  );
}
