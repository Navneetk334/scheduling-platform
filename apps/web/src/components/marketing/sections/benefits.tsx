'use client';

import * as React from 'react';

import { FadeItem, Stagger } from '@/components/dashboard/motion';

import { benefits } from '../data';
import { ConnectGraphic } from '../illustrations';
import { Section, SectionHeading } from '../section';

export function Benefits() {
  return (
    <Section id="benefits">
      <div className="grid items-center gap-12 lg:grid-cols-2">
        <div>
          <SectionHeading
            centered={false}
            eyebrow="Why teams switch"
            title="Outcomes you can measure"
            description="INVINCIBLE PROS is not just prettier scheduling — it moves the numbers that matter to your business."
          />
          <Stagger className="mt-10 grid grid-cols-2 gap-6">
            {benefits.map((b) => (
              <FadeItem key={b.label} className="rounded-2xl border border-border bg-card/50 p-5">
                <div className="bg-gradient-to-r from-primary to-accent bg-clip-text text-3xl font-bold tracking-tight text-transparent">
                  {b.stat}
                </div>
                <div className="mt-1 text-sm font-semibold">{b.label}</div>
                <p className="mt-2 text-sm text-muted-foreground">{b.body}</p>
              </FadeItem>
            ))}
          </Stagger>
        </div>

        <div className="relative">
          <div className="absolute inset-0 -z-10 rounded-3xl bg-gradient-to-tr from-primary/10 to-accent/10 blur-2xl" />
          <div className="rounded-3xl border border-border bg-card/50 p-8">
            <ConnectGraphic />
            <p className="mt-4 text-center text-sm text-muted-foreground">
              Every calendar, video tool, and CRM — connected around a single source of truth.
            </p>
          </div>
        </div>
      </div>
    </Section>
  );
}
