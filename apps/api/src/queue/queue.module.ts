import { BullModule } from '@nestjs/bullmq';
import { Global, Module } from '@nestjs/common';

import { AppConfigService } from '../config/app-config.service';

export const WEBHOOKS_QUEUE = 'webhooks';
export const NOTIFICATIONS_QUEUE = 'notifications';

function redisConnection(url: string) {
  const parsed = new URL(url);
  return {
    host: parsed.hostname,
    port: Number(parsed.port || 6379),
    username: parsed.username || undefined,
    password: parsed.password || undefined,
    // Required by BullMQ workers for blocking commands.
    maxRetriesPerRequest: null,
  };
}

/**
 * Global BullMQ root connection (Redis-backed). Feature modules register their
 * own queues via `BullModule.registerQueue({ name })`.
 */
@Global()
@Module({
  imports: [
    BullModule.forRootAsync({
      inject: [AppConfigService],
      useFactory: (config: AppConfigService) => ({
        connection: redisConnection(config.get('REDIS_URL')),
      }),
    }),
  ],
  exports: [BullModule],
})
export class QueueModule {}
