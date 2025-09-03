import {
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateNotificationDto,
  UpdateNotificationStatusDto,
} from './dto/create-notification.dto';
import { NotificationGateway } from './notification.gateway';

@Injectable()
export class NotificationService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(forwardRef(() => NotificationGateway))
    private readonly notificationGateway: NotificationGateway,
  ) {}

  async createNotification(createNotificationDto: CreateNotificationDto) {
    const { userEmail, message, ...rest } = createNotificationDto;

    if (userEmail === 'all') {
      // Broadcast to all users
      const users = await this.prisma.user.findMany({
        select: { id: true, email: true },
      });

      // Create notifications for each user
      const notifications = [];
      for (const user of users) {
        const notification = await this.prisma.notification.create({
          data: {
            user: {
              connect: {
                id: user.id,
              },
            },
            userEmail: user.email,
            message,
            status: rest.status || 'unread',
          },
        });
        notifications.push(notification);
      }

      const notificationData = { message, status: rest.status || 'unread' };
      this.notificationGateway.emitNotification(notificationData);

      return {
        message: 'Notifications sent to all users',
        count: users.length,
      };
    }

    // Validate email format for individual notifications
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(userEmail)) {
      throw new NotFoundException(`Invalid email format: ${userEmail}`);
    }

    const user = await this.prisma.user.findUnique({
      where: { email: userEmail },
    });
    if (!user) {
      throw new NotFoundException(`User with email ${userEmail} not found`);
    }

    const notification = await this.prisma.notification.create({
      data: {
        user: {
          connect: {
            id: user.id,
          },
        },
        userEmail: user.email,
        message,
        ...rest,
      },
    });

    this.notificationGateway.emitNotification(notification);

    return notification;
  }

  async findAll(
    page: number = 1,
    perPage: number = 10,
    email?: string,
    status?: string,
  ): Promise<{ data: any[]; total: number }> {
    const pageNumber = Number(page) || 1;
    const perPageNumber = Number(perPage) || 10;
    const skip = (pageNumber - 1) * perPageNumber;

    let where: any = {};

    // If email is provided, we need to find users first and use their IDs
    if (email) {
      const users = await this.prisma.user.findMany({
        where: { email: { contains: email, mode: 'insensitive' } },
      });

      if (users.length > 0) {
        where.userId = { in: users.map((user) => user.id) };
      } else {
        // If no users found with that email, return empty results
        return { data: [], total: 0 };
      }
    }

    if (status) {
      where.status = status;
    }

    const [total, data] = await Promise.all([
      this.prisma.notification.count({ where }),
      this.prisma.notification.findMany({
        skip,
        take: perPageNumber,
        where,
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    return { data, total };
  }

  async findOne(id: string) {
    const notification = await this.prisma.notification.findUnique({
      where: { id },
    });
    if (!notification) {
      throw new NotFoundException('Notification not found');
    }
    return notification;
  }

  async getNotificationsForUserByEmail(email: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) {
      throw new NotFoundException(`User with email ${email} not found`);
    }
    return this.prisma.notification.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
    });
  }

  async updateNotificationStatus(
    id: string,
    updateStatusDto: UpdateNotificationStatusDto,
  ) {
    const notification = await this.prisma.notification.findUnique({
      where: { id },
    });
    if (!notification) {
      throw new NotFoundException('Notification not found');
    }
    const updatedNotification = await this.prisma.notification.update({
      where: { id },
      data: { status: updateStatusDto.status },
    });
    this.notificationGateway.emitNotification(updatedNotification);
    return updatedNotification;
  }

  async remove(id: string) {
    const notification = await this.prisma.notification.findUnique({
      where: { id },
    });
    if (!notification) {
      throw new NotFoundException('Notification not found');
    }
    await this.prisma.notification.delete({ where: { id } });
    return { message: 'Notification deleted successfully' };
  }
}
