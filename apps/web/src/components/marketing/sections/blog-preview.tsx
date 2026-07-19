'use client';

import { Badge, Button } from '@invincible/ui';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';
import * as React from 'react';

import { FadeItem, Stagger } from '@/components/dashboard/motion';

import { blogPosts } from '../data';
import { Section } from '../section';

function formatDate(iso: string): string {
  return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(
    new Date(`${iso}T00:00:00Z`),
  );
}

export function BlogPreview() {
  return (
    <Section id="blog" className="bg-muted/20">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="max-w-xl">
          <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-primary">
            <span className="size-1.5 rounded-full bg-gradient-to-r from-primary to-accent" />
            From the blog
          </span>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">Ideas on scheduling & scale</h2>
        </div>
        <Button variant="outline" asChild>
          <Link href="/blog">
            View all posts
            <ArrowRight className="size-4" aria-hidden />
          </Link>
        </Button>
      </div>

      <Stagger className="mt-12 grid gap-4 md:grid-cols-3">
        {blogPosts.map((post) => (
          <FadeItem key={post.slug}>
            <Link
              href="/blog"
              className="group flex h-full flex-col rounded-2xl border border-border bg-card/50 p-6 transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md"
            >
              <div className="aspect-[16/9] rounded-xl bg-gradient-to-br from-primary/15 via-accent/10 to-transparent" />
              <div className="mt-5 flex items-center gap-3 text-xs text-muted-foreground">
                <Badge variant="secondary">{post.category}</Badge>
                <span>{post.readMinutes} min read</span>
              </div>
              <h3 className="mt-3 text-lg font-semibold tracking-tight group-hover:text-primary">{post.title}</h3>
              <p className="mt-2 flex-1 text-sm text-muted-foreground">{post.excerpt}</p>
              <span className="mt-4 text-xs text-muted-foreground">{formatDate(post.date)}</span>
            </Link>
          </FadeItem>
        ))}
      </Stagger>
    </Section>
  );
}
