'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@invincible/ui';
import * as React from 'react';

import { PageHeader } from '@/components/dashboard/page-header';
import { AssetsPanel } from '@/components/dashboard/white-label/assets-panel';
import { BrandsPanel } from '@/components/dashboard/white-label/brands-panel';
import { DomainsPanel } from '@/components/dashboard/white-label/domains-panel';
import { LegalPanel } from '@/components/dashboard/white-label/legal-panel';
import { TemplatesPanel } from '@/components/dashboard/white-label/templates-panel';
import { useActiveOrganization } from '@/hooks/use-organizations';

export default function WhiteLabelPage() {
  const { activeOrganization } = useActiveOrganization();
  const organizationId = activeOrganization?.id;

  return (
    <div>
      <PageHeader
        title="White Label"
        description="Completely customize your platform — brands, domains, emails, legal, and assets."
      />

      <Tabs defaultValue="brands">
        <TabsList className="flex flex-wrap">
          <TabsTrigger value="brands">Brands</TabsTrigger>
          <TabsTrigger value="domains">Domains</TabsTrigger>
          <TabsTrigger value="email">Emails</TabsTrigger>
          <TabsTrigger value="sms">SMS</TabsTrigger>
          <TabsTrigger value="legal">Legal</TabsTrigger>
          <TabsTrigger value="assets">Assets</TabsTrigger>
        </TabsList>

        <TabsContent value="brands" className="mt-6">
          <BrandsPanel organizationId={organizationId} />
        </TabsContent>
        <TabsContent value="domains" className="mt-6">
          <DomainsPanel organizationId={organizationId} />
        </TabsContent>
        <TabsContent value="email" className="mt-6">
          <TemplatesPanel organizationId={organizationId} channel="EMAIL" />
        </TabsContent>
        <TabsContent value="sms" className="mt-6">
          <TemplatesPanel organizationId={organizationId} channel="SMS" />
        </TabsContent>
        <TabsContent value="legal" className="mt-6">
          <LegalPanel organizationId={organizationId} />
        </TabsContent>
        <TabsContent value="assets" className="mt-6">
          <AssetsPanel organizationId={organizationId} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
