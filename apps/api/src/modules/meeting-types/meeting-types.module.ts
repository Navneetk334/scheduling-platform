import { Module } from '@nestjs/common';

import { OrganizationsModule } from '../organizations/organizations.module';

import { MeetingTypesController } from './meeting-types.controller';
import { MeetingTypesService } from './meeting-types.service';

@Module({
  imports: [OrganizationsModule],
  controllers: [MeetingTypesController],
  providers: [MeetingTypesService],
  exports: [MeetingTypesService],
})
export class MeetingTypesModule {}
