'use client';

import type { CreateEventTypeInput } from '@invincible/utils';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { getApiClient } from '@/lib/api';

export const eventTypesKey = (organizationId: string | undefined) =>
  ['event-types', organizationId] as const;

export function useEventTypes(organizationId: string | undefined) {
  return useQuery({
    queryKey: eventTypesKey(organizationId),
    enabled: Boolean(organizationId),
    queryFn: () => getApiClient().eventTypes.list({ organizationId: organizationId! }),
  });
}

export function useCreateEventType(organizationId: string | undefined) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateEventTypeInput) =>
      getApiClient().eventTypes.create(input, { organizationId: organizationId! }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: eventTypesKey(organizationId) });
    },
  });
}
