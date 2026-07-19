import { Module } from '@nestjs/common';

import { AuthModule } from './auth/auth.module';
import { AppConfigModule } from './config/app-config.module';
import { HealthModule } from './health/health.module';
import { AvailabilityModule } from './modules/availability/availability.module';
import { BookingsModule } from './modules/bookings/bookings.module';
import { EventTypesModule } from './modules/event-types/event-types.module';
import { IntegrationsModule } from './modules/integrations/integrations.module';
import { OrganizationsModule } from './modules/organizations/organizations.module';
import { PublicModule } from './modules/public/public.module';
import { SchedulesModule } from './modules/schedules/schedules.module';
import { PrismaModule } from './prisma/prisma.module';
import { RedisModule } from './redis/redis.module';

@Module({
  imports: [
    // Infrastructure (global)
    AppConfigModule,
    PrismaModule,
    RedisModule,
    AuthModule,
    // Feature modules
    HealthModule,
    OrganizationsModule,
    SchedulesModule,
    EventTypesModule,
    AvailabilityModule,
    BookingsModule,
    PublicModule,
    IntegrationsModule,
  ],
})
export class AppModule {}
