'use client';

import { Button } from '@invincible/ui';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';
import * as React from 'react';

import { FadeItem, Stagger } from '@/components/dashboard/motion';

import { integrations } from '../data';
import { Section, SectionHeading } from '../section';

export function Integrations({ showCta = true }: { showCta?: boolean }) {
  return (
    <Section id="integrations" className="bg-muted/20">
      <SectionHeading
        eyebrow="Integrations"
        title="Plays well with your entire stack"
        description="Connect the calendars, video tools, payment processors, and CRMs your team already relies on."
      />

      <Stagger className="mt-14 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {integrations.map((tool) => (
          <FadeItem
            key={tool.name}
            className="flex items-center gap-3 rounded-xl border border-border bg-card/60 p-4 transition-colors hover:border-primary/40"
          >
            <span className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-primary/15 to-accent/15 text-sm font-bold text-primary">
              {tool.initials}
            </span>
            <span className="min-w-0">
              <span className="block truncate text-sm font-medium">{tool.name}</span>
              <span className="block text-xs text-muted-foreground">{tool.category}</span>
            </span>
          </FadeItem>
        ))}
      </Stagger>

      {showCta ? (
        <div className="mt-10 text-center">
          <Button variant="outline" asChild>
            <Link href="/integrations">
              Browse all integrations
              <ArrowRight className="size-4" aria-hidden />
            </Link>
          </Button>
        </div>
      ) : null}
    </Section>
  );
}
