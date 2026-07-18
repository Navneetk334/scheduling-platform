import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { createBookingSchema } from '@invincible/utils';

import { AvailabilityService } from '../modules/availability/availability.service';
import { BookingsService } from '../modules/bookings/bookings.service';
import { PublicService } from '../modules/public/public.service';

import {
  AvailabilitySlotType,
  BookingPageType,
  BookingType,
  CreateBookingGqlInput,
  PublicOrganizationType,
} from './types';

/** Public (unauthenticated) GraphQL surface mirroring the public REST API. */
@Resolver()
export class PublicResolver {
  constructor(
    private readonly publicService: PublicService,
    private readonly availability: AvailabilityService,
    private readonly bookings: BookingsService,
  ) {}

  @Query(() => PublicOrganizationType, { name: 'organization' })
  organization(@Args('slug') slug: string) {
    return this.publicService.getOrganization(slug);
  }

  @Query(() => BookingPageType, { name: 'bookingPage' })
  bookingPage(@Args('orgSlug') orgSlug: string, @Args('eventSlug') eventSlug: string) {
    return this.publicService.getBookingPage(orgSlug, eventSlug);
  }

  @Query(() => [AvailabilitySlotType], { name: 'availability' })
  availabilitySlots(
    @Args('meetingTypeId') meetingTypeId: string,
    @Args('from') from: string,
    @Args('to') to: string,
  ) {
    return this.availability.getSlots(meetingTypeId, from, to);
  }

  @Mutation(() => BookingType, { name: 'createBooking' })
  createBooking(@Args('input') input: CreateBookingGqlInput) {
    const parsed = createBookingSchema.parse({
      meetingTypeId: input.meetingTypeId,
      startTime: input.startTime,
      hostId: input.hostId,
      invitee: input.invitee,
      guests: [],
    });
    return this.bookings.create(parsed);
  }
}
