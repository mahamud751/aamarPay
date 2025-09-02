import { Module } from '@nestjs/common';
import { EventsService } from './events.service';
import { EventsController } from './events.controller';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationService } from '../notification/notification.service';
import { AuditLogService } from '../audit/audit.service';
import { NotificationGateway } from '../notification/notification.gateway';

@Module({
  controllers: [EventsController],
  providers: [
    EventsService,
    PrismaService,
    NotificationService,
    AuditLogService,
    NotificationGateway,
  ],
})
export class EventsModule {}
