import { randomUUID } from 'node:crypto';

import { Module } from '@nestjs/common';
import { APP_GUARD, APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core';
import { LoggerModule } from 'nestjs-pino';

import { ApiKeysModule } from './auth/api-keys/api-keys.module';
import { AuthModule } from './auth/auth.module';
import { IdempotencyInterceptor } from './common/interceptors/idempotency.interceptor';
import { RateLimitGuard } from './common/security/rate-limit.guard';
import { SanitizationPipe } from './common/security/sanitize';
import { AppConfigModule } from './config/app-config.module';
import { AppConfigService } from './config/app-config.service';
import { GraphqlModule } from './graphql/graphql.module';
import { HealthModule } from './health/health.module';
import { JobsModule } from './jobs/jobs.module';
import { AvailabilityModule } from './modules/availability/availability.module';
import { BookingsModule } from './modules/bookings/bookings.module';
import { MeetingTypesModule } from './modules/meeting-types/meeting-types.module';
import { OrganizationsModule } from './modules/organizations/organizations.module';
import { PublicModule } from './modules/public/public.module';
import { SchedulesModule } from './modules/schedules/schedules.module';
import { MetricsInterceptor } from './observability/metrics.interceptor';
import { ObservabilityModule } from './observability/observability.module';
import { PrismaModule } from './prisma/prisma.module';
import { QueueModule } from './queue/queue.module';
import { RedisModule } from './redis/redis.module';
import { WebhooksModule } from './webhooks/webhooks.module';

@Module({
  imports: [
    // --- Infrastructure (global) ---
    AppConfigModule,
    LoggerModule.forRootAsync({
      inject: [AppConfigService],
      useFactory: (config: AppConfigService) => ({
        pinoHttp: {
          level: config.get('LOG_LEVEL'),
          genReqId: (req) => (req.headers['x-request-id'] as string) ?? randomUUID(),
          redact: {
            paths: ['req.headers.authorization', 'req.headers.cookie', 'req.headers["x-api-key"]'],
            remove: true,
          },
          transport: config.isProduction ? undefined : { target: 'pino-pretty' },
        },
      }),
    }),
    PrismaModule,
    RedisModule,
    QueueModule,
    ObservabilityModule,
    AuthModule,
    // --- Feature modules ---
    HealthModule,
    OrganizationsModule,
    ApiKeysModule,
    SchedulesModule,
    MeetingTypesModule,
    AvailabilityModule,
    BookingsModule,
    WebhooksModule,
    JobsModule,
    PublicModule,
    GraphqlModule,
  ],
  providers: [
    { provide: APP_PIPE, useClass: SanitizationPipe },
    { provide: APP_GUARD, useClass: RateLimitGuard },
    { provide: APP_INTERCEPTOR, useClass: MetricsInterceptor },
    { provide: APP_INTERCEPTOR, useClass: IdempotencyInterceptor },
  ],
})
export class AppModule {}
