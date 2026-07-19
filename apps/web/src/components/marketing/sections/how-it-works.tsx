'use client';

import * as React from 'react';

import { FadeItem, Stagger } from '@/components/dashboard/motion';

import { howItWorksSteps } from '../data';
import { Section, SectionHeading } from '../section';

export function HowItWorks() {
  return (
    <Section id="how-it-works" className="bg-muted/20">
      <SectionHeading
        eyebrow="How it works"
        title="Live in minutes, not weeks"
        description="From connecting your calendar to your first booking — the whole flow is designed to get out of your way."
      />

      <Stagger className="relative mt-14 grid gap-8 md:grid-cols-2 lg:grid-cols-4">
        {howItWorksSteps.map((step) => (
          <FadeItem key={step.step} className="relative">
            <div className="flex items-center gap-3">
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-4xl font-bold tracking-tight text-transparent">
                {step.step}
              </span>
              <span className="h-px flex-1 bg-gradient-to-r from-border to-transparent" aria-hidden />
            </div>
            <h3 className="mt-4 font-semibold">{step.title}</h3>
            <p className="mt-2 text-sm text-muted-foreground">{step.body}</p>
          </FadeItem>
        ))}
      </Stagger>
    </Section>
  );
}
