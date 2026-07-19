import type { Metadata } from 'next';
import Link from 'next/link';
import * as React from 'react';

import { Badge } from '@invincible/ui';

import { blogPosts } from '@/components/marketing/data';
import { PageHero } from '@/components/marketing/page-hero';
import { Section } from '@/components/marketing/section';
import { Cta } from '@/components/marketing/sections/cta';

export const metadata: Metadata = {
  title: 'Blog',
  description: 'Product news, engineering deep-dives, and scheduling insights from the INVINCIBLE PROS team.',
  alternates: { canonical: '/blog' },
};

function formatDate(iso: string): string {
  return new Intl.DateTimeFormat('en-US', { month: 'long', day: 'numeric', year: 'numeric' }).format(
    new Date(`${iso}T00:00:00Z`),
  );
}

export default function BlogPage() {
  const [featured, ...rest] = blogPosts;

  if (!featured) return null;

  return (
    <>
      <PageHero
        eyebrow="Blog"
        title="Ideas on scheduling & scale"
        description="Deep-dives on the engineering, product, and productivity behind modern scheduling."
      />

      <Section>
        {/* Featured post */}
        <Link
          href="/blog"
          className="group grid gap-6 rounded-3xl border border-border bg-card/50 p-6 transition-all hover:border-primary/40 hover:shadow-md md:grid-cols-2 md:p-8"
        >
          <div className="aspect-[16/10] rounded-2xl bg-gradient-to-br from-primary/20 via-accent/10 to-transparent" />
          <div className="flex flex-col justify-center">
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <Badge variant="secondary">{featured.category}</Badge>
              <span>{featured.readMinutes} min read</span>
              <span>{formatDate(featured.date)}</span>
            </div>
            <h2 className="mt-3 text-2xl font-semibold tracking-tight group-hover:text-primary">{featured.title}</h2>
            <p className="mt-3 text-muted-foreground">{featured.excerpt}</p>
          </div>
        </Link>

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {rest.map((post) => (
            <Link
              key={post.slug}
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
          ))}
        </div>
      </Section>

      <Cta />
    </>
  );
}
