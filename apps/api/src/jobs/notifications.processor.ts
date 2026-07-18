import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import type { Job } from 'bullmq';

import { NOTIFICATIONS_QUEUE } from '../queue/queue.module';

export interface NotificationJob {
  kind: 'reminder' | 'confirmation' | 'cancellation';
  channel: 'email' | 'sms' | 'whatsapp';
  bookingId: string;
  to: string;
}

/**
 * Processes queued notification jobs. Delivery adapters (Resend / Twilio) are
 * wired in the notifications phase; today it records intent so the pipeline is
 * verifiably exercised end-to-end.
 */
@Processor(NOTIFICATIONS_QUEUE)
export class NotificationsProcessor extends WorkerHost {
  private readonly logger = new Logger(NotificationsProcessor.name);

  process(job: Job<NotificationJob>): Promise<void> {
    const { kind, channel, to, bookingId } = job.data;
    this.logger.log(`[${channel}] ${kind} for booking ${bookingId} → ${to}`);
    return Promise.resolve();
  }
}
