import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { NotificationModule } from './notification/notification.module';
import { PermissionModule } from './permission/permission.module';

import { SocketService } from './socket.service';
import { EventsModule } from './events/events.module';

@Module({
  providers: [SocketService],
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    AuthModule,
    PrismaModule,
    UsersModule,
    NotificationModule,
    PermissionModule,
    EventsModule,
  ],
})
export class AppModule {}
