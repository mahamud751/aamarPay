import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuditLogService {
  constructor(private readonly prisma: PrismaService) {}

  async log(
    entityId: string,
    entityType: string,
    action: string,
    oldValue: any,
    newValue: any,
  ) {
    await this.prisma.auditLog.create({
      data: {
        entityId,
        entityType,
        action,
        oldValue: oldValue ? oldValue : null,
        newValue: newValue ? newValue : null,
      },
    });
  }

  async getLogs(
    entityId?: string,
    entityType?: string,
    action?: string,
    startDate?: Date,
    endDate?: Date,
    skip?: number,
    take?: number,
  ) {
    return this.prisma.auditLog.findMany({
      where: {
        ...(entityId && { entityId }),
        ...(entityType && { entityType }),
        ...(action && { action }),
        ...(startDate &&
          endDate && {
            timestamp: {
              gte: startDate,
              lte: endDate,
            },
          }),
      },
      orderBy: { timestamp: 'desc' },
      skip,
      take,
    });
  }
}
