import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { UpdatePermissionDto } from './dto/update-permission.dto';
import { AuditLogService } from '../audit/audit.service';

@Injectable()
export class PermissionService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditLogService: AuditLogService,
  ) {}

  async create(createPermissionDto: CreatePermissionDto) {
    const { users, name, ...rest } = createPermissionDto;

    const existingPermission = await this.prisma.permission.findUnique({
      where: { name },
    });

    if (existingPermission) {
      throw new BadRequestException('Permission with this name already exists');
    }

    try {
      const permission = await this.prisma.permission.create({
        data: {
          name,
          ...rest,
          users: {
            connect: users?.map((userId) => ({ id: userId })),
          },
        },
        include: { users: true },
      });

      await this.auditLogService.log(
        permission.id,
        'Permission',
        'CREATE',
        null,
        permission,
      );
      return { message: 'Permission created successfully', permission };
    } catch (error) {
      console.error('Error creating permission:', error);
      throw new InternalServerErrorException('Failed to create permission');
    }
  }

  async findAll(
    page: number = 1,
    perPage: number = 10,
  ): Promise<{ data: any[]; total: number }> {
    const pageNumber = Number(page) || 1;
    const perPageNumber = Number(perPage) || 10;
    const skip = (pageNumber - 1) * perPageNumber;

    const [total, data] = await Promise.all([
      this.prisma.permission.count(),
      this.prisma.permission.findMany({
        skip,
        take: perPageNumber,
        orderBy: { name: 'desc' },
        include: { users: true },
      }),
    ]);

    return { data, total };
  }

  async findOne(id: string) {
    const permission = await this.prisma.permission.findUnique({
      where: { id },
      include: { users: true },
    });

    if (!permission) {
      throw new NotFoundException('Permission not found');
    }
    return permission;
  }

  async update(id: string, updatePermissionDto: UpdatePermissionDto) {
    const oldPermission = await this.prisma.permission.findUnique({
      where: { id },
    });

    if (!oldPermission) {
      throw new NotFoundException('Permission not found');
    }

    const permissionUpdate = await this.prisma.permission.update({
      where: { id },
      data: updatePermissionDto,
    });

    await this.auditLogService.log(
      id,
      'Permission',
      'UPDATE',
      oldPermission,
      permissionUpdate,
    );
    return {
      message: 'Permission updated successfully',
      permission: permissionUpdate,
    };
  }

  async remove(id: string) {
    const permission = await this.prisma.permission.findUnique({
      where: { id },
    });

    if (!permission) {
      throw new NotFoundException('Permission not found');
    }

    await this.prisma.permission.delete({ where: { id } });
    await this.auditLogService.log(
      id,
      'Permission',
      'DELETE',
      permission,
      null,
    );
    return { message: 'Permission deleted successfully' };
  }
}
