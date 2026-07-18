import { InjectQueue } from '@nestjs/bullmq';
import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Queue } from 'bullmq';

import { PrismaService } from '../prisma/prisma.service';
import { NOTIFICATIONS_QUEUE } from '../queue/queue.module';

import type { NotificationJob } from './notifications.processor';

/**
 * Sweeps for meetings starting soon and enqueues reminder notifications.
 * Idempotency of individual sends is handled by the notifications layer.
 */
@Injectable()
export class RemindersCron {
  private readonly logger = new Logger(RemindersCron.name);

  constructor(
    private readonly prisma: PrismaService,
    @InjectQueue(NOTIFICATIONS_QUEUE) private readonly queue: Queue<NotificationJob>,
  ) {}

  @Cron(CronExpression.EVERY_30_MINUTES)
  async enqueueUpcomingReminders(): Promise<void> {
    const now = new Date();
    const soon = new Date(now.getTime() + 60 * 60 * 1000); // next hour

    const bookings = await this.prisma.booking.findMany({
      where: { status: 'CONFIRMED', startTime: { gte: now, lte: soon } },
      include: { guests: { where: { isPrimary: true }, take: 1 } },
      take: 200,
    });

    for (const booking of bookings) {
      const invitee = booking.guests[0];
      if (!invitee) continue;
      await this.queue.add('reminder', {
        kind: 'reminder',
        channel: 'email',
        bookingId: booking.id,
        to: invitee.email,
      });
    }

    if (bookings.length > 0) {
      this.logger.log(`Enqueued reminders for ${bookings.length} upcoming booking(s).`);
    }
  }
}
