import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';

import { OrganizationsModule } from '../modules/organizations/organizations.module';
import { WEBHOOKS_QUEUE } from '../queue/queue.module';

import { WebhookDeliveryProcessor } from './webhook-delivery.processor';
import { WebhooksController } from './webhooks.controller';
import { WebhooksService } from './webhooks.service';

@Module({
  imports: [
    OrganizationsModule,
    BullModule.registerQueue({
      name: WEBHOOKS_QUEUE,
      defaultJobOptions: {
        attempts: 5,
        backoff: { type: 'exponential', delay: 2000 },
        removeOnComplete: 1000,
        removeOnFail: 5000,
      },
    }),
  ],
  controllers: [WebhooksController],
  providers: [WebhooksService, WebhookDeliveryProcessor],
  exports: [WebhooksService],
})
export class WebhooksModule {}
