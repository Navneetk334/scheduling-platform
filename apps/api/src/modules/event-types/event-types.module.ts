import { Module } from '@nestjs/common';

import { OrganizationsModule } from '../organizations/organizations.module';

import { EventTypesController } from './event-types.controller';
import { EventTypesService } from './event-types.service';

@Module({
  imports: [OrganizationsModule],
  controllers: [EventTypesController],
  providers: [EventTypesService],
  exports: [EventTypesService],
})
export class EventTypesModule {}
