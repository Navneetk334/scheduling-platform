import * as React from 'react';

import { cn } from '../lib/cn';

export interface LogoProps extends React.HTMLAttributes<HTMLSpanElement> {
  showWordmark?: boolean;
}

/**
 * Original INVINCIBLE PROS brand mark: an interlocking "IP" monogram in an
 * indigo tile. No third-party or copied assets.
 */
export function Logo({ showWordmark = true, className, ...props }: LogoProps) {
  return (
    <span className={cn('inline-flex items-center gap-2', className)} {...props}>
      <svg
        width="28"
        height="28"
        viewBox="0 0 32 32"
        role="img"
        aria-label="INVINCIBLE PROS"
        className="shrink-0"
      >
        <rect width="32" height="32" rx="8" fill="hsl(var(--primary))" />
        <path d="M11 9h2.4v14H11z" fill="hsl(var(--primary-foreground))" />
        <path
          d="M16 9h4.2c2.7 0 4.3 1.5 4.3 3.9s-1.7 4-4.4 4H18.4V23H16zm2.4 2v3.9h1.6c1.2 0 2-.7 2-1.9s-.8-2-2-2z"
          fill="hsl(var(--primary-foreground))"
        />
      </svg>
      {showWordmark ? (
        <span className="text-base font-semibold tracking-tight">
          INVINCIBLE<span className="text-primary"> PROS</span>
        </span>
      ) : null}
    </span>
  );
}
