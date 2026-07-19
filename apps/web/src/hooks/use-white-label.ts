'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type {
  CreateBrandAssetInput,
  CreateBrandInput,
  CreateDomainInput,
  CreateMessageTemplateInput,
  UpdateBrandInput,
  UpdateMessageTemplateInput,
  UpsertBrandThemeInput,
  UpsertLegalDocumentInput,
} from '@invincible/utils';

import { getApiClient } from '@/lib/api';

const enabledFor = (organizationId: string | undefined) => Boolean(organizationId);

// --- Brands ----------------------------------------------------------------

export const brandsKey = (organizationId: string | undefined) => ['wl-brands', organizationId] as const;

export function useBrands(organizationId: string | undefined) {
  return useQuery({
    queryKey: brandsKey(organizationId),
    enabled: enabledFor(organizationId),
    queryFn: () => getApiClient().brands.list({ organizationId: organizationId! }),
  });
}

export function useCreateBrand(organizationId: string | undefined) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateBrandInput) =>
      getApiClient().brands.create(input, { organizationId: organizationId! }),
    onSuccess: () => void qc.invalidateQueries({ queryKey: brandsKey(organizationId) }),
  });
}

export function useUpdateBrand(organizationId: string | undefined) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateBrandInput }) =>
      getApiClient().brands.update(id, input, { organizationId: organizationId! }),
    onSuccess: () => void qc.invalidateQueries({ queryKey: brandsKey(organizationId) }),
  });
}

export function useDeleteBrand(organizationId: string | undefined) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => getApiClient().brands.remove(id, { organizationId: organizationId! }),
    onSuccess: () => void qc.invalidateQueries({ queryKey: brandsKey(organizationId) }),
  });
}

export function useSetDefaultBrand(organizationId: string | undefined) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => getApiClient().brands.setDefault(id, { organizationId: organizationId! }),
    onSuccess: () => void qc.invalidateQueries({ queryKey: brandsKey(organizationId) }),
  });
}

export function useUpsertBrandTheme(organizationId: string | undefined) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpsertBrandThemeInput }) =>
      getApiClient().brands.upsertTheme(id, input, { organizationId: organizationId! }),
    onSuccess: () => void qc.invalidateQueries({ queryKey: brandsKey(organizationId) }),
  });
}

// --- Domains ---------------------------------------------------------------

export const domainsKey = (organizationId: string | undefined) => ['wl-domains', organizationId] as const;

export function useDomains(organizationId: string | undefined) {
  return useQuery({
    queryKey: domainsKey(organizationId),
    enabled: enabledFor(organizationId),
    queryFn: () => getApiClient().domains.list({ organizationId: organizationId! }),
  });
}

export function useCreateDomain(organizationId: string | undefined) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateDomainInput) =>
      getApiClient().domains.create(input, { organizationId: organizationId! }),
    onSuccess: () => void qc.invalidateQueries({ queryKey: domainsKey(organizationId) }),
  });
}

export function useVerifyDomain(organizationId: string | undefined) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => getApiClient().domains.verify(id, { organizationId: organizationId! }),
    onSuccess: () => void qc.invalidateQueries({ queryKey: domainsKey(organizationId) }),
  });
}

export function useProvisionSsl(organizationId: string | undefined) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => getApiClient().domains.provisionSsl(id, { organizationId: organizationId! }),
    onSuccess: () => void qc.invalidateQueries({ queryKey: domainsKey(organizationId) }),
  });
}

export function useDeleteDomain(organizationId: string | undefined) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => getApiClient().domains.remove(id, { organizationId: organizationId! }),
    onSuccess: () => void qc.invalidateQueries({ queryKey: domainsKey(organizationId) }),
  });
}

// --- Templates -------------------------------------------------------------

export const templatesKey = (organizationId: string | undefined) => ['wl-templates', organizationId] as const;

export function useTemplates(organizationId: string | undefined) {
  return useQuery({
    queryKey: templatesKey(organizationId),
    enabled: enabledFor(organizationId),
    queryFn: () => getApiClient().templates.list({ organizationId: organizationId! }),
  });
}

export function useCreateTemplate(organizationId: string | undefined) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateMessageTemplateInput) =>
      getApiClient().templates.create(input, { organizationId: organizationId! }),
    onSuccess: () => void qc.invalidateQueries({ queryKey: templatesKey(organizationId) }),
  });
}

export function useUpdateTemplate(organizationId: string | undefined) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateMessageTemplateInput }) =>
      getApiClient().templates.update(id, input, { organizationId: organizationId! }),
    onSuccess: () => void qc.invalidateQueries({ queryKey: templatesKey(organizationId) }),
  });
}

export function useDeleteTemplate(organizationId: string | undefined) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => getApiClient().templates.remove(id, { organizationId: organizationId! }),
    onSuccess: () => void qc.invalidateQueries({ queryKey: templatesKey(organizationId) }),
  });
}

// --- Legal -----------------------------------------------------------------

export const legalKey = (organizationId: string | undefined) => ['wl-legal', organizationId] as const;

export function useLegalDocuments(organizationId: string | undefined) {
  return useQuery({
    queryKey: legalKey(organizationId),
    enabled: enabledFor(organizationId),
    queryFn: () => getApiClient().legal.list({ organizationId: organizationId! }),
  });
}

export function useUpsertLegalDocument(organizationId: string | undefined) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: UpsertLegalDocumentInput) =>
      getApiClient().legal.upsert(input, { organizationId: organizationId! }),
    onSuccess: () => void qc.invalidateQueries({ queryKey: legalKey(organizationId) }),
  });
}

// --- Assets ----------------------------------------------------------------

export const assetsKey = (organizationId: string | undefined) => ['wl-assets', organizationId] as const;

export function useAssets(organizationId: string | undefined) {
  return useQuery({
    queryKey: assetsKey(organizationId),
    enabled: enabledFor(organizationId),
    queryFn: () => getApiClient().assets.list({ organizationId: organizationId! }),
  });
}

export function useCreateAsset(organizationId: string | undefined) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateBrandAssetInput) =>
      getApiClient().assets.create(input, { organizationId: organizationId! }),
    onSuccess: () => void qc.invalidateQueries({ queryKey: assetsKey(organizationId) }),
  });
}

export function useDeleteAsset(organizationId: string | undefined) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => getApiClient().assets.remove(id, { organizationId: organizationId! }),
    onSuccess: () => void qc.invalidateQueries({ queryKey: assetsKey(organizationId) }),
  });
}
