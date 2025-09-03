import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { NotificationService } from '../notification/notification.service';
import { AuditLogService } from '../audit/audit.service';
import { UserRole } from '@prisma/client';

@Injectable()
export class EventsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationService: NotificationService,
    private readonly auditLogService: AuditLogService,
  ) {}

  private async checkPermission(
    user: any,
    permissionName: string,
  ): Promise<boolean> {
    const userWithPermissions = await this.prisma.user.findUnique({
      where: { id: user.userId },
      include: { permissions: true },
    });
    return (
      userWithPermissions?.permissions.some(
        (perm) => perm.name === permissionName,
      ) || false
    );
  }

  async create(createEventDto: CreateEventDto, user: any) {
    try {
      // Validate user object
      if (!user || !user.userId) {
        throw new UnauthorizedException('User not authenticated');
      }

      const event = await this.prisma.event.create({
        data: {
          ...createEventDto,
          date: new Date(createEventDto.date),
          userId: user.userId,
          isUserCreated: true,
        },
        include: { user: { select: { id: true, name: true, email: true } } },
      });

      // Only send notification if userEmail exists
      if (user.email) {
        try {
          await this.notificationService.createNotification({
            userEmail: 'all',
            message: `New event created: ${event.title} by ${user.email}`,
          });
        } catch (notificationError) {
          // Log notification error but don't fail the event creation
          console.error('Failed to send notification:', notificationError);
        }
      }

      await this.auditLogService.log(event.id, 'Event', 'CREATE', null, event);

      return { message: 'Event created successfully', event };
    } catch (error) {
      // Log the actual error for debugging
      console.error('Error creating event:', error);
      throw error;
    }
  }

  async findAll() {
    const events = await this.prisma.event.findMany({
      include: { user: { select: { id: true, name: true, email: true } } },
      orderBy: { createdAt: 'desc' },
    });
    return { data: events, total: events.length };
  }

  async findUserEvents(userId: string) {
    const events = await this.prisma.event.findMany({
      where: { userId },
      include: { user: { select: { id: true, name: true, email: true } } },
      orderBy: { createdAt: 'desc' },
    });
    return { data: events, total: events.length };
  }

  async findOne(id: string) {
    const event = await this.prisma.event.findUnique({
      where: { id },
      include: { user: { select: { id: true, name: true, email: true } } },
    });
    if (!event) {
      throw new NotFoundException('Event not found');
    }
    return event;
  }

  async update(id: string, updateEventDto: UpdateEventDto, user: any) {
    const event = await this.findOne(id);

    const canUpdateAll =
      (await this.checkPermission(user, 'event.update.all')) ||
      [UserRole.superAdmin, UserRole.admin].includes(user.role);
    const canUpdateOwn =
      (await this.checkPermission(user, 'event.update.own')) &&
      event.userId === user.userId;

    if (!canUpdateAll && !canUpdateOwn) {
      throw new UnauthorizedException('Unauthorized to update this event');
    }

    const updatedEvent = await this.prisma.event.update({
      where: { id },
      data: {
        ...updateEventDto,
        date: updateEventDto.date ? new Date(updateEventDto.date) : event.date,
      },
      include: { user: { select: { id: true, name: true, email: true } } },
    });

    await this.auditLogService.log(id, 'Event', 'UPDATE', event, updatedEvent);

    return { message: 'Event updated successfully', event: updatedEvent };
  }

  async delete(id: string, user: any) {
    const event = await this.findOne(id);

    const canDeleteAll =
      (await this.checkPermission(user, 'event.delete.all')) ||
      [UserRole.superAdmin, UserRole.admin].includes(user.role);
    const canDeleteOwn =
      (await this.checkPermission(user, 'event.delete.own')) &&
      event.userId === user.userId;

    if (!canDeleteAll && !canDeleteOwn) {
      throw new UnauthorizedException('Unauthorized to delete this event');
    }

    await this.prisma.event.delete({ where: { id } });
    await this.auditLogService.log(id, 'Event', 'DELETE', event, null);

    return { message: 'Event deleted successfully' };
  }

  async rsvp(id: string, user: any) {
    const canRsvp =
      (await this.checkPermission(user, 'event.rsvp')) ||
      [UserRole.superAdmin, UserRole.admin, UserRole.user].includes(user.role);
    if (!canRsvp) {
      throw new UnauthorizedException('Unauthorized to RSVP to this event');
    }

    const event = await this.findOne(id);

    const updatedEvent = await this.prisma.event.update({
      where: { id },
      data: { rsvpCount: event.rsvpCount + 1 },
      include: { user: { select: { id: true, name: true, email: true } } },
    });

    if (event.userId) {
      await this.notificationService.createNotification({
        userEmail: event.user.email,
        message: `User ${user.email} RSVP'd to your event: ${event.title}`,
      });
    }

    await this.auditLogService.log(id, 'Event', 'RSVP', event, updatedEvent);

    return { message: 'RSVP recorded successfully', event: updatedEvent };
  }
}
