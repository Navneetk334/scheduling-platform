'use client';

import { useMutation, useQuery } from '@tanstack/react-query';
import type { AvailableSlot, Booking } from '@invincible/types';
import type { CreateBookingInput } from '@invincible/utils';

import { getApiClient } from '@/lib/api';

export function useAvailability(params: {
  meetingTypeId: string;
  from: string;
  to: string;
  timeZone: string;
}) {
  return useQuery<AvailableSlot[]>({
    queryKey: ['availability', params.meetingTypeId, params.from, params.to, params.timeZone],
    queryFn: () =>
      getApiClient().public.getAvailability(params.meetingTypeId, {
        from: params.from,
        to: params.to,
        timeZone: params.timeZone,
      }),
  });
}

export function useCreateBooking() {
  return useMutation<Booking, Error, CreateBookingInput>({
    mutationFn: (input) => getApiClient().public.createBooking(input),
  });
}
