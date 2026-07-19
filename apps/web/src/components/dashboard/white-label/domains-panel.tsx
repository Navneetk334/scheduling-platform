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
import type { Domain } from '@invincible/types';
import { Globe, Loader2, Plus, RefreshCw, ShieldCheck, Trash2 } from 'lucide-react';
import * as React from 'react';

import { EmptyState } from '@/components/dashboard/empty-state';
import { StatusBadge } from '@/components/dashboard/status-badge';
import {
  useBrands,
  useCreateDomain,
  useDeleteDomain,
  useDomains,
  useProvisionSsl,
  useVerifyDomain,
} from '@/hooks/use-white-label';

import { Select } from './textarea';

export function DomainsPanel({ organizationId }: { organizationId: string | undefined }) {
  const { data: domains, isLoading, isError, error } = useDomains(organizationId);
  const { data: brands } = useBrands(organizationId);
  const createDomain = useCreateDomain(organizationId);

  const [kind, setKind] = React.useState<'CUSTOM' | 'SUBDOMAIN'>('CUSTOM');
  const [hostname, setHostname] = React.useState('');
  const [subdomain, setSubdomain] = React.useState('');
  const [brandId, setBrandId] = React.useState('');

  const onCreate = (e: React.FormEvent) => {
    e.preventDefault();
    createDomain.mutate(
      {
        kind,
        hostname: kind === 'CUSTOM' ? hostname.trim().toLowerCase() : undefined,
        subdomain: kind === 'SUBDOMAIN' ? subdomain.trim().toLowerCase() : undefined,
        brandId: brandId || undefined,
      },
      {
        onSuccess: () => {
          setHostname('');
          setSubdomain('');
        },
      },
    );
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Add a domain</CardTitle>
          <CardDescription>Serve booking pages on your own domain with automatic SSL.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={onCreate} className="space-y-4">
            <div className="inline-flex rounded-lg border p-1">
              {(['CUSTOM', 'SUBDOMAIN'] as const).map((k) => (
                <button
                  key={k}
                  type="button"
                  onClick={() => setKind(k)}
                  className={cn(
                    'rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
                    kind === k ? 'bg-primary text-primary-foreground' : 'text-muted-foreground',
                  )}
                >
                  {k === 'CUSTOM' ? 'Custom domain' : 'Platform subdomain'}
                </button>
              ))}
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {kind === 'CUSTOM' ? (
                <Field id="dom-host" label="Hostname" description="e.g. book.acme.com">
                  <Input id="dom-host" value={hostname} onChange={(e) => setHostname(e.target.value)} placeholder="book.acme.com" />
                </Field>
              ) : (
                <Field id="dom-sub" label="Subdomain" description="Becomes yourname.invinciblepros.app">
                  <div className="flex items-center">
                    <Input id="dom-sub" value={subdomain} onChange={(e) => setSubdomain(e.target.value)} placeholder="acme" className="rounded-r-none" />
                    <span className="inline-flex h-10 items-center rounded-r-md border border-l-0 border-input bg-muted px-3 text-sm text-muted-foreground">
                      .invinciblepros.app
                    </span>
                  </div>
                </Field>
              )}
              <Field id="dom-brand" label="Brand (optional)">
                <Select id="dom-brand" value={brandId} onChange={(e) => setBrandId(e.target.value)}>
                  <option value="">Organization default</option>
                  {brands?.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name}
                    </option>
                  ))}
                </Select>
              </Field>
            </div>

            <Button type="submit" disabled={createDomain.isPending}>
              <Plus className="size-4" /> {createDomain.isPending ? 'Adding…' : 'Add domain'}
            </Button>
            {createDomain.isError ? (
              <Alert variant="destructive">
                <AlertDescription>{(createDomain.error as Error)?.message}</AlertDescription>
              </Alert>
            ) : null}
          </form>
        </CardContent>
      </Card>

      {isError ? (
        <Alert variant="destructive">
          <AlertDescription>{(error as Error)?.message ?? 'Failed to load domains.'}</AlertDescription>
        </Alert>
      ) : null}

      {isLoading ? (
        <Skeleton className="h-32 w-full" />
      ) : domains && domains.length > 0 ? (
        <div className="space-y-4">
          {domains.map((domain) => (
            <DomainCard key={domain.id} domain={domain} organizationId={organizationId} />
          ))}
        </div>
      ) : (
        <EmptyState icon={Globe} title="No domains yet" description="Add a custom domain or platform subdomain to get started." />
      )}
    </div>
  );
}

function DomainCard({ domain, organizationId }: { domain: Domain; organizationId: string | undefined }) {
  const verify = useVerifyDomain(organizationId);
  const provisionSsl = useProvisionSsl(organizationId);
  const deleteDomain = useDeleteDomain(organizationId);

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <CardTitle className="flex items-center gap-2 text-base">
              <code className="text-sm">{domain.hostname}</code>
              {domain.isPrimary ? <Badge variant="secondary">Primary</Badge> : null}
            </CardTitle>
            <CardDescription className="mt-1 flex items-center gap-2">
              <StatusBadge status={domain.status} />
              <span className="inline-flex items-center gap-1 text-xs">
                <ShieldCheck className="size-3.5" aria-hidden /> SSL: {domain.sslStatus}
              </span>
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => verify.mutate(domain.id)} disabled={verify.isPending}>
              {verify.isPending ? <Loader2 className="size-4 animate-spin" aria-hidden /> : <RefreshCw className="size-4" aria-hidden />}
              Verify
            </Button>
            <Button variant="outline" size="sm" onClick={() => provisionSsl.mutate(domain.id)} disabled={provisionSsl.isPending}>
              <ShieldCheck className="size-4" aria-hidden /> Provision SSL
            </Button>
            <Button variant="ghost" size="sm" className="text-destructive" onClick={() => deleteDomain.mutate(domain.id)} aria-label={`Remove ${domain.hostname}`}>
              <Trash2 className="size-4" aria-hidden />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {domain.failureReason ? (
          <Alert variant="destructive">
            <AlertDescription>{domain.failureReason}</AlertDescription>
          </Alert>
        ) : null}
        {domain.dnsRecords && domain.dnsRecords.length > 0 ? (
          <div>
            <p className="mb-2 text-sm font-medium">Add these DNS records, then click Verify:</p>
            <div className="overflow-x-auto rounded-lg border">
              <table className="w-full text-left text-xs">
                <thead className="bg-muted/50 text-muted-foreground">
                  <tr>
                    <th className="px-3 py-2 font-medium">Type</th>
                    <th className="px-3 py-2 font-medium">Name</th>
                    <th className="px-3 py-2 font-medium">Value</th>
                  </tr>
                </thead>
                <tbody>
                  {domain.dnsRecords.map((r, i) => (
                    <tr key={i} className="border-t">
                      <td className="px-3 py-2 font-mono">{r.type}</td>
                      <td className="px-3 py-2 font-mono break-all">{r.name}</td>
                      <td className="px-3 py-2 font-mono break-all">{r.value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
