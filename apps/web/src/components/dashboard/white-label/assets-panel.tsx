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
} from '@invincible/ui';
import { ImageIcon, Plus, Trash2 } from 'lucide-react';
import * as React from 'react';

import { EmptyState } from '@/components/dashboard/empty-state';
import { useAssets, useCreateAsset, useDeleteAsset } from '@/hooks/use-white-label';

import { Select } from './textarea';

const ASSET_TYPES = ['LOGO', 'LOGO_DARK', 'FAVICON', 'OG_IMAGE', 'FONT', 'IMAGE'] as const;

const isImage = (type: string) => ['LOGO', 'LOGO_DARK', 'FAVICON', 'OG_IMAGE', 'IMAGE'].includes(type);

export function AssetsPanel({ organizationId }: { organizationId: string | undefined }) {
  const { data: assets, isLoading, isError, error } = useAssets(organizationId);
  const createAsset = useCreateAsset(organizationId);
  const deleteAsset = useDeleteAsset(organizationId);

  const [type, setType] = React.useState<(typeof ASSET_TYPES)[number]>('LOGO');
  const [name, setName] = React.useState('');
  const [url, setUrl] = React.useState('');

  const onCreate = (e: React.FormEvent) => {
    e.preventDefault();
    createAsset.mutate(
      { type, name: name.trim(), url: url.trim() },
      { onSuccess: () => { setName(''); setUrl(''); } },
    );
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Add asset</CardTitle>
          <CardDescription>Store logos, favicons, fonts, and images to reuse across brands.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={onCreate} className="grid gap-4 sm:grid-cols-4">
            <Field id="asset-type" label="Type">
              <Select id="asset-type" value={type} onChange={(e) => setType(e.target.value as typeof type)}>
                {ASSET_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t.replace('_', ' ')}
                  </option>
                ))}
              </Select>
            </Field>
            <Field id="asset-name" label="Name">
              <Input id="asset-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Primary logo" />
            </Field>
            <Field id="asset-url" label="URL" className="sm:col-span-2">
              <Input id="asset-url" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://cdn.example.com/logo.svg" />
            </Field>
            <div className="sm:col-span-4">
              <Button type="submit" disabled={createAsset.isPending || !name.trim() || !url.trim()}>
                <Plus className="size-4" /> {createAsset.isPending ? 'Adding…' : 'Add asset'}
              </Button>
            </div>
          </form>
          {createAsset.isError ? (
            <Alert variant="destructive" className="mt-4">
              <AlertDescription>{(createAsset.error as Error)?.message}</AlertDescription>
            </Alert>
          ) : null}
        </CardContent>
      </Card>

      {isError ? (
        <Alert variant="destructive">
          <AlertDescription>{(error as Error)?.message ?? 'Failed to load assets.'}</AlertDescription>
        </Alert>
      ) : null}

      {isLoading ? (
        <Skeleton className="h-40 w-full" />
      ) : assets && assets.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {assets.map((asset) => (
            <Card key={asset.id}>
              <CardContent className="flex items-center gap-3 py-4">
                <div className="flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-lg border bg-muted">
                  {isImage(asset.type) ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={asset.url} alt={asset.name} className="size-full object-contain" />
                  ) : (
                    <ImageIcon className="size-5 text-muted-foreground" aria-hidden />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{asset.name}</p>
                  <Badge variant="secondary" className="mt-1">{asset.type.replace('_', ' ')}</Badge>
                </div>
                <Button variant="ghost" size="sm" className="text-destructive" onClick={() => deleteAsset.mutate(asset.id)} aria-label={`Delete ${asset.name}`}>
                  <Trash2 className="size-4" aria-hidden />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState icon={ImageIcon} title="No assets yet" description="Upload your brand assets to reuse them anywhere." />
      )}
    </div>
  );
}
