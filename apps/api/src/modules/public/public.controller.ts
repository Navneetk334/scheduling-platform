import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import {
  cancelBookingSchema,
  createBookingSchema,
  availabilityQuerySchema,
  rescheduleBookingSchema,
  type CreateBookingInput,
} from '@invincible/utils';

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

  @Get('organizations/:orgSlug')
  getOrganization(@Param('orgSlug') orgSlug: string) {
    return this.publicService.getOrganization(orgSlug);
  }

  @Get('booking-pages/:orgSlug/:eventSlug')
  getBookingPage(@Param('orgSlug') orgSlug: string, @Param('eventSlug') eventSlug: string) {
    return this.publicService.getBookingPage(orgSlug, eventSlug);
  }

  @Get('meeting-types/:meetingTypeId/availability')
  getAvailability(
    @Param('meetingTypeId') meetingTypeId: string,
    @Query() query: Record<string, string>,
  ) {
    const parsed = availabilityQuerySchema.parse({ ...query, meetingTypeId });
    return this.availability.getSlots(parsed.meetingTypeId, parsed.from, parsed.to);
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

  @Post('bookings/:reference/reschedule')
  rescheduleBooking(
    @Param('reference') reference: string,
    @Body(new ZodValidationPipe(rescheduleBookingSchema)) body: { startTime: string },
  ) {
    return this.bookings.rescheduleByReference(reference, body.startTime);
  }
}
