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
  Switch,
  cn,
} from '@invincible/ui';
import type { Brand } from '@invincible/types';
import { Check, ChevronDown, Palette, Plus, Star, Trash2 } from 'lucide-react';
import * as React from 'react';

import { EmptyState } from '@/components/dashboard/empty-state';
import {
  useBrands,
  useCreateBrand,
  useDeleteBrand,
  useSetDefaultBrand,
  useUpdateBrand,
  useUpsertBrandTheme,
} from '@/hooks/use-white-label';

import { ColorField, Select, Textarea } from './textarea';

export function BrandsPanel({ organizationId }: { organizationId: string | undefined }) {
  const { data: brands, isLoading, isError, error } = useBrands(organizationId);
  const createBrand = useCreateBrand(organizationId);

  const [name, setName] = React.useState('');
  const [primaryColor, setPrimaryColor] = React.useState('#4F46E5');
  const [accentColor, setAccentColor] = React.useState('#06B6D4');

  const onCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    createBrand.mutate(
      { name: name.trim(), primaryColor, accentColor },
      { onSuccess: () => setName('') },
    );
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Create a brand</CardTitle>
          <CardDescription>
            Each brand is a complete identity — colors, logo, fonts, emails, and its own domain.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={onCreate} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Field id="brand-name" label="Brand name" className="sm:col-span-2 lg:col-span-2">
              <Input
                id="brand-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Acme Booking"
              />
            </Field>
            <ColorField id="brand-primary" label="Primary" value={primaryColor} onChange={setPrimaryColor} />
            <ColorField id="brand-accent" label="Accent" value={accentColor} onChange={setAccentColor} />
            <div className="sm:col-span-2 lg:col-span-4">
              <Button type="submit" disabled={createBrand.isPending || !name.trim()}>
                <Plus className="size-4" /> {createBrand.isPending ? 'Creating…' : 'Create brand'}
              </Button>
            </div>
          </form>
          {createBrand.isError ? (
            <Alert variant="destructive" className="mt-4">
              <AlertDescription>{(createBrand.error as Error)?.message}</AlertDescription>
            </Alert>
          ) : null}
        </CardContent>
      </Card>

      {isError ? (
        <Alert variant="destructive">
          <AlertDescription>{(error as Error)?.message ?? 'Failed to load brands.'}</AlertDescription>
        </Alert>
      ) : null}

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {[0, 1].map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-5 w-40" />
                <Skeleton className="h-4 w-full" />
              </CardHeader>
            </Card>
          ))}
        </div>
      ) : brands && brands.length > 0 ? (
        <div className="space-y-4">
          {brands.map((brand) => (
            <BrandCard key={brand.id} brand={brand} organizationId={organizationId} />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={Palette}
          title="No brands yet"
          description="Create your first brand to start customizing your platform."
        />
      )}
    </div>
  );
}

function BrandCard({ brand, organizationId }: { brand: Brand; organizationId: string | undefined }) {
  const [open, setOpen] = React.useState(false);
  const setDefault = useSetDefaultBrand(organizationId);
  const deleteBrand = useDeleteBrand(organizationId);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex -space-x-1">
              <span className="size-6 rounded-full ring-2 ring-background" style={{ backgroundColor: brand.primaryColor }} />
              <span className="size-6 rounded-full ring-2 ring-background" style={{ backgroundColor: brand.accentColor }} />
            </div>
            <div>
              <CardTitle className="flex items-center gap-2 text-base">
                {brand.name}
                {brand.isDefault ? (
                  <Badge variant="secondary" className="gap-1">
                    <Star className="size-3" aria-hidden /> Default
                  </Badge>
                ) : null}
                {!brand.isActive ? <Badge variant="outline">Inactive</Badge> : null}
              </CardTitle>
              <CardDescription>/{brand.slug}</CardDescription>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {!brand.isDefault ? (
              <Button variant="outline" size="sm" onClick={() => setDefault.mutate(brand.id)} disabled={setDefault.isPending}>
                Make default
              </Button>
            ) : null}
            <Button variant="ghost" size="sm" onClick={() => setOpen((v) => !v)} aria-expanded={open}>
              Customize <ChevronDown className={cn('ml-1 size-4 transition-transform', open && 'rotate-180')} aria-hidden />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-destructive"
              onClick={() => deleteBrand.mutate(brand.id)}
              disabled={deleteBrand.isPending}
              aria-label={`Delete ${brand.name}`}
            >
              <Trash2 className="size-4" aria-hidden />
            </Button>
          </div>
        </div>
      </CardHeader>
      {open ? (
        <CardContent>
          <BrandEditor brand={brand} organizationId={organizationId} />
        </CardContent>
      ) : null}
    </Card>
  );
}

function BrandEditor({ brand, organizationId }: { brand: Brand; organizationId: string | undefined }) {
  const update = useUpdateBrand(organizationId);
  const upsertTheme = useUpsertBrandTheme(organizationId);

  const [form, setForm] = React.useState({
    logoUrl: brand.logoUrl ?? '',
    faviconUrl: brand.faviconUrl ?? '',
    primaryColor: brand.primaryColor,
    accentColor: brand.accentColor,
    backgroundColor: brand.backgroundColor,
    foregroundColor: brand.foregroundColor,
    headingFont: brand.headingFont,
    bodyFont: brand.bodyFont,
    defaultThemeMode: brand.defaultThemeMode,
    removeBranding: brand.removeBranding,
    loginHeadline: brand.loginHeadline ?? '',
    loginSubheadline: brand.loginSubheadline ?? '',
    footerHtml: brand.footerHtml ?? '',
    customCss: brand.customCss ?? '',
    emailFromName: brand.emailFromName ?? '',
    emailFromAddress: brand.emailFromAddress ?? '',
    supportEmail: brand.supportEmail ?? '',
    smsSenderId: brand.smsSenderId ?? '',
  });

  const set = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const onSave = () => {
    update.mutate({
      id: brand.id,
      input: {
        logoUrl: form.logoUrl || null,
        faviconUrl: form.faviconUrl || null,
        primaryColor: form.primaryColor,
        accentColor: form.accentColor,
        backgroundColor: form.backgroundColor,
        foregroundColor: form.foregroundColor,
        headingFont: form.headingFont,
        bodyFont: form.bodyFont,
        defaultThemeMode: form.defaultThemeMode,
        removeBranding: form.removeBranding,
        loginHeadline: form.loginHeadline || null,
        loginSubheadline: form.loginSubheadline || null,
        footerHtml: form.footerHtml || null,
        customCss: form.customCss || null,
        emailFromName: form.emailFromName || null,
        emailFromAddress: form.emailFromAddress || null,
        supportEmail: form.supportEmail || null,
        smsSenderId: form.smsSenderId || null,
      },
    });
  };

  return (
    <div className="space-y-6">
      <section className="space-y-4">
        <h4 className="text-sm font-semibold">Logo &amp; favicon</h4>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field id={`${brand.id}-logo`} label="Logo URL">
            <Input id={`${brand.id}-logo`} value={form.logoUrl} onChange={(e) => set('logoUrl', e.target.value)} placeholder="https://…" />
          </Field>
          <Field id={`${brand.id}-favicon`} label="Favicon URL">
            <Input id={`${brand.id}-favicon`} value={form.faviconUrl} onChange={(e) => set('faviconUrl', e.target.value)} placeholder="https://…" />
          </Field>
        </div>
      </section>

      <section className="space-y-4">
        <h4 className="text-sm font-semibold">Colors</h4>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <ColorField id={`${brand.id}-primary`} label="Primary" value={form.primaryColor} onChange={(v) => set('primaryColor', v)} />
          <ColorField id={`${brand.id}-accent`} label="Accent" value={form.accentColor} onChange={(v) => set('accentColor', v)} />
          <ColorField id={`${brand.id}-bg`} label="Background" value={form.backgroundColor} onChange={(v) => set('backgroundColor', v)} />
          <ColorField id={`${brand.id}-fg`} label="Foreground" value={form.foregroundColor} onChange={(v) => set('foregroundColor', v)} />
        </div>
      </section>

      <section className="space-y-4">
        <h4 className="text-sm font-semibold">Typography &amp; theme</h4>
        <div className="grid gap-4 sm:grid-cols-3">
          <Field id={`${brand.id}-hfont`} label="Heading font">
            <Input id={`${brand.id}-hfont`} value={form.headingFont} onChange={(e) => set('headingFont', e.target.value)} />
          </Field>
          <Field id={`${brand.id}-bfont`} label="Body font">
            <Input id={`${brand.id}-bfont`} value={form.bodyFont} onChange={(e) => set('bodyFont', e.target.value)} />
          </Field>
          <Field id={`${brand.id}-mode`} label="Default theme">
            <Select
              id={`${brand.id}-mode`}
              value={form.defaultThemeMode}
              onChange={(e) => set('defaultThemeMode', e.target.value as typeof form.defaultThemeMode)}
            >
              <option value="SYSTEM">System</option>
              <option value="LIGHT">Light</option>
              <option value="DARK">Dark</option>
            </Select>
          </Field>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={() => upsertTheme.mutate({ id: brand.id, input: { mode: 'LIGHT' } })} disabled={upsertTheme.isPending}>
            Regenerate light theme
          </Button>
          <Button variant="outline" size="sm" onClick={() => upsertTheme.mutate({ id: brand.id, input: { mode: 'DARK' } })} disabled={upsertTheme.isPending}>
            Regenerate dark theme
          </Button>
        </div>
      </section>

      <section className="space-y-4">
        <h4 className="text-sm font-semibold">Custom login page</h4>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field id={`${brand.id}-lh`} label="Login headline">
            <Input id={`${brand.id}-lh`} value={form.loginHeadline} onChange={(e) => set('loginHeadline', e.target.value)} placeholder="Welcome back" />
          </Field>
          <Field id={`${brand.id}-ls`} label="Login subheadline">
            <Input id={`${brand.id}-ls`} value={form.loginSubheadline} onChange={(e) => set('loginSubheadline', e.target.value)} />
          </Field>
        </div>
      </section>

      <section className="space-y-4">
        <h4 className="text-sm font-semibold">Messaging identity</h4>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Field id={`${brand.id}-efn`} label="Email from name">
            <Input id={`${brand.id}-efn`} value={form.emailFromName} onChange={(e) => set('emailFromName', e.target.value)} />
          </Field>
          <Field id={`${brand.id}-efa`} label="Email from address">
            <Input id={`${brand.id}-efa`} value={form.emailFromAddress} onChange={(e) => set('emailFromAddress', e.target.value)} placeholder="hello@brand.com" />
          </Field>
          <Field id={`${brand.id}-se`} label="Support email">
            <Input id={`${brand.id}-se`} value={form.supportEmail} onChange={(e) => set('supportEmail', e.target.value)} />
          </Field>
          <Field id={`${brand.id}-sms`} label="SMS sender ID">
            <Input id={`${brand.id}-sms`} value={form.smsSenderId} onChange={(e) => set('smsSenderId', e.target.value)} maxLength={11} />
          </Field>
        </div>
      </section>

      <section className="space-y-4">
        <h4 className="text-sm font-semibold">Advanced</h4>
        <div className="flex items-center justify-between rounded-lg border p-3">
          <div>
            <p className="text-sm font-medium">Remove platform branding</p>
            <p className="text-xs text-muted-foreground">Hide “Powered by INVINCIBLE PROS” on booking pages and emails.</p>
          </div>
          <Switch checked={form.removeBranding} onCheckedChange={(v) => set('removeBranding', v)} aria-label="Remove platform branding" />
        </div>
        <Field id={`${brand.id}-footer`} label="Custom footer (HTML)">
          <Textarea id={`${brand.id}-footer`} value={form.footerHtml} onChange={(e) => set('footerHtml', e.target.value)} rows={3} />
        </Field>
        <Field id={`${brand.id}-css`} label="Custom CSS">
          <Textarea id={`${brand.id}-css`} value={form.customCss} onChange={(e) => set('customCss', e.target.value)} rows={4} className="font-mono text-xs" />
        </Field>
      </section>

      <div className="flex items-center gap-3">
        <Button onClick={onSave} disabled={update.isPending}>
          {update.isPending ? 'Saving…' : 'Save changes'}
        </Button>
        {update.isSuccess ? (
          <span className="inline-flex items-center gap-1 text-sm text-primary">
            <Check className="size-4" aria-hidden /> Saved
          </span>
        ) : null}
        {update.isError ? (
          <span className="text-sm text-destructive">{(update.error as Error)?.message}</span>
        ) : null}
      </div>
    </div>
  );
}
