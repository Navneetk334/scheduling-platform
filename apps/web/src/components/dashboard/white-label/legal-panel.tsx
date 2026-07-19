'use client';

import {
  Alert,
  AlertDescription,
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Field,
  Input,
  Skeleton,
  cn,
} from '@invincible/ui';
import { Check } from 'lucide-react';
import * as React from 'react';

import { useLegalDocuments, useUpsertLegalDocument } from '@/hooks/use-white-label';

import { Textarea } from './textarea';

const DOC_TYPES = [
  { value: 'PRIVACY_POLICY', label: 'Privacy Policy', title: 'Privacy Policy' },
  { value: 'TERMS_OF_SERVICE', label: 'Terms of Service', title: 'Terms of Service' },
  { value: 'COOKIE_POLICY', label: 'Cookie Policy', title: 'Cookie Policy' },
] as const;

type DocType = (typeof DOC_TYPES)[number]['value'];

export function LegalPanel({ organizationId }: { organizationId: string | undefined }) {
  const { data: docs, isLoading, isError, error } = useLegalDocuments(organizationId);
  const upsert = useUpsertLegalDocument(organizationId);

  const [active, setActive] = React.useState<DocType>('PRIVACY_POLICY');

  // Organization-level document (brandId null) for the active type.
  const existing = React.useMemo(
    () => (docs ?? []).find((d) => d.type === active && d.brandId === null),
    [docs, active],
  );

  const [title, setTitle] = React.useState('');
  const [content, setContent] = React.useState('');

  // Reset editor when switching type or when data loads.
  React.useEffect(() => {
    const meta = DOC_TYPES.find((d) => d.value === active)!;
    setTitle(existing?.title ?? meta.title);
    setContent(existing?.content ?? '');
  }, [active, existing]);

  const save = (publish: boolean) => {
    upsert.mutate({ type: active, title: title.trim(), content, publish });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2">
        {DOC_TYPES.map((d) => (
          <button
            key={d.value}
            type="button"
            onClick={() => setActive(d.value)}
            className={cn(
              'rounded-full border px-4 py-1.5 text-sm font-medium transition-colors',
              active === d.value ? 'border-primary bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-secondary',
            )}
          >
            {d.label}
          </button>
        ))}
      </div>

      {isError ? (
        <Alert variant="destructive">
          <AlertDescription>{(error as Error)?.message ?? 'Failed to load documents.'}</AlertDescription>
        </Alert>
      ) : null}

      {isLoading ? (
        <Skeleton className="h-80 w-full" />
      ) : (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base">{DOC_TYPES.find((d) => d.value === active)!.label}</CardTitle>
                <CardDescription>Overrides the platform default for this document.</CardDescription>
              </div>
              {existing ? (
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">v{existing.version}</Badge>
                  {existing.publishedAt ? <Badge variant="outline">Published</Badge> : <Badge variant="outline">Draft</Badge>}
                </div>
              ) : null}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <Field id="legal-title" label="Title">
              <Input id="legal-title" value={title} onChange={(e) => setTitle(e.target.value)} />
            </Field>
            <Field id="legal-content" label="Content (Markdown or HTML)">
              <Textarea id="legal-content" value={content} onChange={(e) => setContent(e.target.value)} rows={16} className="font-mono text-xs" />
            </Field>
            <div className="flex items-center gap-3">
              <Button variant="outline" onClick={() => save(false)} disabled={upsert.isPending || !content.trim()}>
                Save draft
              </Button>
              <Button onClick={() => save(true)} disabled={upsert.isPending || !content.trim()}>
                {upsert.isPending ? 'Saving…' : 'Save & publish'}
              </Button>
              {upsert.isSuccess ? (
                <span className="inline-flex items-center gap-1 text-sm text-primary">
                  <Check className="size-4" aria-hidden /> Saved
                </span>
              ) : null}
              {upsert.isError ? <span className="text-sm text-destructive">{(upsert.error as Error)?.message}</span> : null}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
