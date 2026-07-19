import * as React from 'react';

import { Aurora, DotGrid } from './gradient';
import { Eyebrow } from './section';

interface PageHeroProps {
  eyebrow?: string;
  title: React.ReactNode;
  description?: React.ReactNode;
  children?: React.ReactNode;
}

/** Shared hero band for interior marketing pages. */
export function PageHero({ eyebrow, title, description, children }: PageHeroProps) {
  return (
    <section className="relative overflow-hidden border-b border-border">
      <Aurora />
      <DotGrid />
      <div className="mx-auto max-w-4xl px-6 py-20 text-center sm:py-28">
        {eyebrow ? <Eyebrow className="justify-center">{eyebrow}</Eyebrow> : null}
        <h1 className="mt-4 text-balance text-4xl font-semibold tracking-tight sm:text-5xl">{title}</h1>
        {description ? (
          <p className="mx-auto mt-5 max-w-2xl text-pretty text-lg text-muted-foreground">{description}</p>
        ) : null}
        {children ? <div className="mt-8 flex flex-wrap items-center justify-center gap-3">{children}</div> : null}
      </div>
    </section>
  );
}
