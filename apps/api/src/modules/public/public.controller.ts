import {
  cancelBookingSchema,
  createBookingSchema,
  availabilityQuerySchema,
  type CreateBookingInput,
} from '@invincible/utils';
import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';

import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import { AvailabilityService } from '../availability/availability.service';
import { BookingsService } from '../bookings/bookings.service';

import { PublicService } from './public.service';

/**
 * Unauthenticated, public-facing endpoints powering the booking experience.
 * Rate limiting is applied globally at the edge (see main.ts / infra).
 */
@Controller({ path: 'public', version: '1' })
export class PublicController {
  constructor(
    private readonly publicService: PublicService,
    private readonly availability: AvailabilityService,
    private readonly bookings: BookingsService,
  ) {}

  @Get('booking-pages/:orgSlug/:eventSlug')
  getBookingPage(@Param('orgSlug') orgSlug: string, @Param('eventSlug') eventSlug: string) {
    return this.publicService.getBookingPage(orgSlug, eventSlug);
  }

  @Get('event-types/:eventTypeId/availability')
  getAvailability(
    @Param('eventTypeId') eventTypeId: string,
    @Query() query: Record<string, string>,
  ) {
    const parsed = availabilityQuerySchema.parse({ ...query, eventTypeId });
    return this.availability.getSlots(parsed.eventTypeId, parsed.from, parsed.to);
  }

  @Post('bookings')
  createBooking(
    @Body(new ZodValidationPipe(createBookingSchema)) body: CreateBookingInput,
  ) {
    return this.bookings.create(body);
  }

  @Get('bookings/:reference')
  getBooking(@Param('reference') reference: string) {
    return this.bookings.getByReference(reference);
  }

  @Post('bookings/:reference/cancel')
  cancelBooking(
    @Param('reference') reference: string,
    @Body(new ZodValidationPipe(cancelBookingSchema)) body: { reason?: string },
  ) {
    return this.bookings.cancelByReference(reference, body.reason);
  }
}
