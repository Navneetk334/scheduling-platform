'use client';

import { useQuery } from '@tanstack/react-query';

import { getApiClient } from '@/lib/api';

export const organizationsKey = ['organizations'] as const;

/** Fetches the current user's organizations (with roles). */
export function useOrganizations() {
  return useQuery({
    queryKey: organizationsKey,
    queryFn: () => getApiClient().organizations.list(),
  });
}

/**
 * Convenience hook returning the "active" organization — for Phase 1 this is
 * simply the first org the user belongs to. A future org switcher will make
 * this user-selectable.
 */
export function useActiveOrganization() {
  const query = useOrganizations();
  return {
    ...query,
    activeOrganization: query.data?.[0] ?? null,
  };
}
