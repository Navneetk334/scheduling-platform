'use client';

import { Avatar, AvatarFallback } from '@invincible/ui';
import { Star } from 'lucide-react';
import * as React from 'react';

import { FadeItem, Stagger } from '@/components/dashboard/motion';

import { testimonials } from '../data';
import { Section, SectionHeading } from '../section';

export function Testimonials() {
  return (
    <Section id="testimonials">
      <SectionHeading
        eyebrow="Testimonials"
        title="Loved by the teams who rely on it"
        description="Thousands of professionals trust INVINCIBLE PROS to run their most important conversations."
      />

      <Stagger className="mt-14 grid gap-4 sm:grid-cols-2">
        {testimonials.map((t) => (
          <FadeItem
            key={t.name}
            className="flex flex-col rounded-2xl border border-border bg-card/50 p-6"
          >
            <div className="flex gap-0.5 text-primary" aria-label="5 out of 5 stars">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className="size-4 fill-current" aria-hidden />
              ))}
            </div>
            <blockquote className="mt-4 flex-1 text-pretty text-[15px] leading-7">“{t.quote}”</blockquote>
            <figcaption className="mt-6 flex items-center gap-3">
              <Avatar>
                <AvatarFallback className="bg-gradient-to-br from-primary/20 to-accent/20 text-sm font-semibold text-primary">
                  {t.initials}
                </AvatarFallback>
              </Avatar>
              <div>
                <div className="text-sm font-semibold">{t.name}</div>
                <div className="text-xs text-muted-foreground">{t.role}</div>
              </div>
            </figcaption>
          </FadeItem>
        ))}
      </Stagger>
    </Section>
  );
}
