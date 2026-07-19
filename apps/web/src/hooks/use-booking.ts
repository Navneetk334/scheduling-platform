'use client';

import type { AvailableSlot, Booking } from '@invincible/types';
import type { CreateBookingInput } from '@invincible/utils';
import { useMutation, useQuery } from '@tanstack/react-query';

import { getApiClient } from '@/lib/api';

export function useAvailability(params: {
  eventTypeId: string;
  from: string;
  to: string;
  timeZone: string;
}) {
  return useQuery<AvailableSlot[]>({
    queryKey: ['availability', params.eventTypeId, params.from, params.to, params.timeZone],
    queryFn: () =>
      getApiClient().public.getAvailability(params.eventTypeId, {
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
