'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { CreateMeetingTypeInput } from '@invincible/utils';

import { getApiClient } from '@/lib/api';

export const meetingTypesKey = (organizationId: string | undefined) =>
  ['meeting-types', organizationId] as const;

export function useMeetingTypes(organizationId: string | undefined) {
  return useQuery({
    queryKey: meetingTypesKey(organizationId),
    enabled: Boolean(organizationId),
    queryFn: () => getApiClient().meetingTypes.list({ organizationId: organizationId! }),
  });
}

export function useCreateMeetingType(organizationId: string | undefined) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateMeetingTypeInput) =>
      getApiClient().meetingTypes.create(input, { organizationId: organizationId! }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: meetingTypesKey(organizationId) });
    },
  });
}
