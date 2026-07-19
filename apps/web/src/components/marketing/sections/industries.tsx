'use client';

import * as React from 'react';

import { FadeItem, Stagger } from '@/components/dashboard/motion';

import { industries } from '../data';
import { getIcon } from '../icon-map';
import { Section, SectionHeading } from '../section';

export function Industries() {
  return (
    <Section id="industries">
      <SectionHeading
        eyebrow="Industries"
        title="Built for the way your team works"
        description="From sales floors to clinics to classrooms, teams shape INVINCIBLE PROS to fit their exact workflow."
      />

      <Stagger className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {industries.map((industry) => {
          const Icon = getIcon(industry.icon);
          return (
            <FadeItem
              key={industry.name}
              className="group relative overflow-hidden rounded-2xl border border-border bg-card/50 p-6 transition-all hover:-translate-y-0.5 hover:shadow-md"
            >
              <div className="absolute -right-8 -top-8 size-24 rounded-full bg-gradient-to-br from-primary/10 to-accent/10 blur-xl transition-opacity group-hover:opacity-100" />
              <div className="flex size-11 items-center justify-center rounded-xl bg-gradient-to-br from-primary/15 to-accent/15 text-primary">
                <Icon className="size-5" aria-hidden />
              </div>
              <h3 className="mt-4 font-semibold">{industry.name}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{industry.body}</p>
            </FadeItem>
          );
        })}
      </Stagger>
    </Section>
  );
}
