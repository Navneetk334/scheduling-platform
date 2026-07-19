'use client';

import { cn } from '@invincible/ui';
import * as React from 'react';

import { FadeItem, Stagger } from '@/components/dashboard/motion';

import { coreFeatures } from '../data';
import { getIcon } from '../icon-map';
import { Section, SectionHeading } from '../section';

export function Features({ heading = true }: { heading?: boolean }) {
  return (
    <Section id="features">
      {heading ? (
        <SectionHeading
          eyebrow="Features"
          title="Everything you need to schedule at scale"
          description="One platform for booking pages, team routing, payments, reminders, and automation — with the reliability an enterprise demands."
        />
      ) : null}

      <Stagger className={cn('grid gap-4 sm:grid-cols-2 lg:grid-cols-4', heading && 'mt-14')}>
        {coreFeatures.map((feature) => {
          const Icon = getIcon(feature.icon);
          return (
            <FadeItem
              key={feature.title}
              className="group rounded-2xl border border-border bg-card/50 p-6 transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md"
            >
              <div className="flex size-11 items-center justify-center rounded-xl bg-gradient-to-br from-primary/15 to-accent/15 text-primary transition-transform group-hover:scale-110">
                <Icon className="size-5" aria-hidden />
              </div>
              <h3 className="mt-4 font-semibold">{feature.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{feature.body}</p>
            </FadeItem>
          );
        })}
      </Stagger>
    </Section>
  );
}
