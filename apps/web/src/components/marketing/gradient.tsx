import { cn } from '@invincible/ui';
import * as React from 'react';

/** Gradient-filled text (Invincible Indigo → Signal Cyan). */
export function GradientText({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <span className={cn('bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent', className)}>
      {children}
    </span>
  );
}

/**
 * Decorative aurora background — soft, blurred gradient blobs. Purely visual
 * (aria-hidden) and GPU-cheap.
 */
export function Aurora({ className }: { className?: string }) {
  return (
    <div className={cn('pointer-events-none absolute inset-0 -z-10 overflow-hidden', className)} aria-hidden>
      <div className="absolute -top-24 left-1/2 size-[38rem] -translate-x-1/2 rounded-full bg-primary/20 blur-[120px]" />
      <div className="absolute top-40 right-0 size-[26rem] rounded-full bg-accent/20 blur-[120px]" />
      <div className="absolute -bottom-24 left-0 size-[26rem] rounded-full bg-primary/10 blur-[120px]" />
    </div>
  );
}

/** Subtle dotted grid backdrop. */
export function DotGrid({ className }: { className?: string }) {
  return (
    <div
      className={cn('pointer-events-none absolute inset-0 -z-10', className)}
      aria-hidden
      style={{
        backgroundImage: 'radial-gradient(hsl(var(--foreground)/0.06) 1px, transparent 1px)',
        backgroundSize: '22px 22px',
        maskImage: 'radial-gradient(ellipse at center, black, transparent 75%)',
      }}
    />
  );
}
