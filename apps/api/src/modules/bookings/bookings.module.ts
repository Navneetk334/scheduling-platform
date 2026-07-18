import { Module } from '@nestjs/common';

import { WebhooksModule } from '../../webhooks/webhooks.module';
import { AvailabilityModule } from '../availability/availability.module';
import { OrganizationsModule } from '../organizations/organizations.module';

import { BookingsController } from './bookings.controller';
import { BookingsService } from './bookings.service';

@Module({
  imports: [AvailabilityModule, OrganizationsModule, WebhooksModule],
  controllers: [BookingsController],
  providers: [BookingsService],
  exports: [BookingsService],
})
export class BookingsModule {}
