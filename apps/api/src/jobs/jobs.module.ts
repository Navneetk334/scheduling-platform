import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';

import { NOTIFICATIONS_QUEUE } from '../queue/queue.module';

import { NotificationsProcessor } from './notifications.processor';
import { RemindersCron } from './reminders.cron';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    BullModule.registerQueue({
      name: NOTIFICATIONS_QUEUE,
      defaultJobOptions: { attempts: 3, backoff: { type: 'exponential', delay: 5000 } },
    }),
  ],
  providers: [RemindersCron, NotificationsProcessor],
})
export class JobsModule {}
