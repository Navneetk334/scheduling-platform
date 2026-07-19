import * as React from 'react';

import { trustedCompanies } from '../data';

export function TrustedBy() {
  return (
    <section className="border-y border-border bg-muted/20 py-10" aria-label="Trusted by leading teams">
      <div className="mx-auto max-w-6xl px-6">
        <p className="text-center text-sm font-medium text-muted-foreground">
          Trusted by fast-growing teams around the world
        </p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-x-10 gap-y-6">
          {trustedCompanies.map((name) => (
            <span
              key={name}
              className="text-lg font-semibold tracking-tight text-muted-foreground/70 grayscale transition-colors hover:text-foreground"
            >
              {name}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
