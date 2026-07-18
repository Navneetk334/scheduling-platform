import { Module } from '@nestjs/common';

import { OrganizationsModule } from '../organizations/organizations.module';

import { SchedulesController } from './schedules.controller';
import { SchedulesService } from './schedules.service';

@Module({
  imports: [OrganizationsModule],
  controllers: [SchedulesController],
  providers: [SchedulesService],
  exports: [SchedulesService],
})
export class SchedulesModule {}
