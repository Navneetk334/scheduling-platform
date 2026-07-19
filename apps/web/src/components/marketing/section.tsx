import { cn } from '@invincible/ui';
import * as React from 'react';

/** Vertical rhythm wrapper for marketing sections. */
export function Section({
  id,
  className,
  children,
}: {
  id?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className={cn('py-20 sm:py-28', className)}>
      <div className="mx-auto max-w-6xl px-6">{children}</div>
    </section>
  );
}

/** Small uppercase label with a gradient dot. */
export function Eyebrow({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-primary',
        className,
      )}
    >
      <span className="size-1.5 rounded-full bg-gradient-to-r from-primary to-accent" />
      {children}
    </span>
  );
}

interface SectionHeadingProps {
  eyebrow?: string;
  title: React.ReactNode;
  description?: React.ReactNode;
  centered?: boolean;
  className?: string;
}

export function SectionHeading({ eyebrow, title, description, centered = true, className }: SectionHeadingProps) {
  return (
    <div className={cn(centered ? 'mx-auto max-w-2xl text-center' : 'max-w-2xl', className)}>
      {eyebrow ? <Eyebrow>{eyebrow}</Eyebrow> : null}
      <h2 className="mt-3 text-balance text-3xl font-semibold tracking-tight sm:text-4xl">{title}</h2>
      {description ? (
        <p className="mt-4 text-pretty text-lg text-muted-foreground">{description}</p>
      ) : null}
    </div>
  );
}
