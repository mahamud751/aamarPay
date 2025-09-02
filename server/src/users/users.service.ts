import {
  Injectable,
  NotFoundException,
  BadRequestException,
  UnauthorizedException,
  InternalServerErrorException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { UpdatePasswordDto } from './dto/update-password.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import { ConfigService } from '@nestjs/config';
import { Prisma, UserRole } from '@prisma/client';
import { AuditLogService } from '../audit/audit.service';

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
    private readonly auditLogService: AuditLogService,
  ) {}

  async createUser(
    createUserDto: CreateUserDto,
  ): Promise<{ user: any; token: string }> {
    const {
      name,
      address,
      email,
      phone,
      password,
      role,
      photos,
      provider,
      providerId,
    } = createUserDto;
    const photoObjects =
      photos?.map((photo) => ({
        title: photo.title,
        src: photo.src,
      })) || [];

    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new BadRequestException('User with email already exists');
    }

    let hashedPassword: string | undefined;
    if (password) {
      hashedPassword = await bcrypt.hash(password, 10);
    }

    const existingUserWithRole = await this.prisma.user.findFirst({
      where: { role: (role as UserRole) || 'user' },
      include: { permissions: true },
    });

    const permissionIdsToCopy =
      existingUserWithRole?.permissions?.map((perm) => perm.id) || [];

    const user = await this.prisma.user.create({
      data: {
        name,
        address,
        email,
        phone,
        role: (role as UserRole) || 'user',
        password: hashedPassword,
        photos: photoObjects,
        provider,
        providerId,
        status: 'active',
        permissions: {
          connect: permissionIdsToCopy.map((id) => ({ id })),
        },
      },
      include: { permissions: true },
    });

    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      this.configService.get('JWT_SECRET'),
      { expiresIn: '1h' },
    );

    const userData = {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      address: user.address,
      role: user.role,
      permissions: user.permissions.map((permission) => ({
        id: permission.id,
        name: permission.name,
      })),
    };

    await this.auditLogService.log(user.id, 'User', 'CREATE', null, userData);

    return { user: userData, token };
  }

  async loginUser(
    loginUserDto: LoginUserDto,
  ): Promise<{ token: string; user: Partial<any> }> {
    const { email, password } = loginUserDto;

    const user = await this.prisma.user.findUnique({
      where: { email },
      include: { permissions: true },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.status === 'blocked' || user.status === 'deactive') {
      throw new UnauthorizedException(
        'User is blocked or deactivated and cannot log in',
      );
    }

    if (!user.password) {
      throw new UnauthorizedException('No password set for this user');
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      throw new UnauthorizedException('Invalid password');
    }

    const userData = {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      address: user.address,
      role: user.role,
      permissions: user.permissions.map((permission) => ({
        id: permission.id,
        name: permission.name,
      })),
    };

    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      this.configService.get('JWT_SECRET'),
      { expiresIn: '1h' },
    );

    return { token, user: userData };
  }

  async loginAdmin(
    loginUserDto: LoginUserDto,
  ): Promise<{ token: string; user: Partial<any> }> {
    const { email, password } = loginUserDto;

    const user = await this.prisma.user.findUnique({
      where: { email },
      include: { permissions: true },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.status === 'blocked' || user.status === 'deactive') {
      throw new UnauthorizedException(
        'User is blocked or deactivated and cannot log in',
      );
    }

    if (
      user.role !== UserRole.superAdmin &&
      user.role !== UserRole.admin &&
      user.role !== UserRole.manager
    ) {
      throw new UnauthorizedException('User has no admin access');
    }

    if (!user.password) {
      throw new UnauthorizedException('No password set for this user');
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      throw new UnauthorizedException('Invalid password');
    }

    const userData = {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      address: user.address,
      role: user.role,
      permissions: user.permissions.map((permission) => ({
        id: permission.id,
        name: permission.name,
      })),
    };

    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      this.configService.get('JWT_SECRET'),
      { expiresIn: '1h' },
    );

    return { token, user: userData };
  }

  async updatePassword(
    updatePasswordDto: UpdatePasswordDto,
  ): Promise<{ message: string }> {
    const {
      userId,
      currentPassword,
      newPassword,
      name,
      email,
      phone,
      address,
      photos,
    } = updatePasswordDto;

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { permissions: true },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (currentPassword && user.password) {
      const passwordMatch = await bcrypt.compare(
        currentPassword,
        user.password,
      );
      if (!passwordMatch) {
        throw new UnauthorizedException('Current password is incorrect');
      }
    }

    const hashedPassword = newPassword
      ? await bcrypt.hash(newPassword, 10)
      : user.password;
    const photoObjects =
      photos?.map((photo) => ({ title: photo.title, src: photo.src })) ||
      user.photos;

    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: {
        name: name || user.name,
        email: email || user.email,
        phone: phone || user.phone,
        address: address || user.address,
        password: hashedPassword,
        photos: photoObjects,
      },
      include: { permissions: true },
    });

    await this.auditLogService.log(userId, 'User', 'UPDATE', user, updatedUser);

    return { message: 'User data updated successfully' };
  }

  async deleteUser(id: string): Promise<string> {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    await this.prisma.user.delete({ where: { id } });
    await this.auditLogService.log(id, 'User', 'DELETE', user, null);
    return 'Deleted successfully';
  }

  async getUsers(
    role?: UserRole,
    email?: string,
    page: number = 1,
    perPage: number = 25,
  ): Promise<{ data: any[]; total: number }> {
    const pageNumber = Number(page) || 1;
    const perPageNumber = Number(perPage) || 10;
    const skip = (pageNumber - 1) * perPageNumber;

    const where: Prisma.UserWhereInput = {
      ...(role && { role }),
      ...(email && { email: { contains: email, mode: 'insensitive' } }),
    };

    const [total, data] = await Promise.all([
      this.prisma.user.count({ where }),
      this.prisma.user.findMany({
        skip,
        take: perPageNumber,
        where,
        orderBy: { createdAt: 'desc' },
        include: { permissions: true },
      }),
    ]);

    return { data, total };
  }

  async getAdmin(email: string): Promise<any> {
    const adminUser = await this.prisma.user.findUnique({
      where: {
        email,
        role: {
          in: [UserRole.admin, UserRole.superAdmin],
        },
      },
      include: { permissions: true },
    });
    if (!adminUser) {
      throw new NotFoundException('Admin user not found');
    }
    return adminUser;
  }

  async getVendors(): Promise<any[]> {
    return this.prisma.user.findMany({ where: { role: UserRole.vendor } });
  }

  async getJWT(email: string): Promise<{ accessToken: string }> {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      this.configService.get('JWT_SECRET'),
      { expiresIn: '1h' },
    );
    return { accessToken: token };
  }

  async getUser(id: string): Promise<any> {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: { permissions: true },
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async updateUser(id: string, updateUserDto: UpdateUserDto) {
    const oldUser = await this.prisma.user.findUnique({
      where: { id },
      include: { permissions: true },
    });

    if (!oldUser) {
      throw new NotFoundException('User not found');
    }

    const { photos, name, email, address, phone, status, permissions } =
      updateUserDto;

    const photoObjects =
      photos?.map((photo) => ({ title: photo.title, src: photo.src })) ||
      oldUser.photos;

    let permissionsData = undefined;
    if (permissions) {
      permissionsData = {
        set: permissions.map((permissionId) => ({ id: permissionId })),
      };
    }

    const userUpdate = await this.prisma.user.update({
      where: { id },
      data: {
        name: name || oldUser.name,
        email: email || oldUser.email,
        address: address || oldUser.address,
        phone: phone || oldUser.phone,
        status: status || oldUser.status,
        photos: photoObjects,
        permissions: permissionsData,
      },
      include: { permissions: true },
    });

    await this.auditLogService.log(id, 'User', 'UPDATE', oldUser, userUpdate);
    return { message: 'User updated successfully', userUpdate };
  }

  async updateUserRole(id: string, updateUserDto: UpdateUserDto) {
    const oldUser = await this.prisma.user.findUnique({
      where: { id },
      include: { permissions: true },
    });

    if (!oldUser) {
      throw new NotFoundException('User not found');
    }

    const { permissions, role } = updateUserDto;

    let permissionsData = undefined;

    if (role && role !== oldUser.role) {
      const newRolePermissions = await this.prisma.user.findFirst({
        where: { role },
        include: { permissions: true },
      });

      const permissionIdsToSet =
        newRolePermissions?.permissions?.map((perm) => perm.id) || [];

      permissionsData = {
        set: permissionIdsToSet.map((id) => ({ id })),
      };
    } else if (permissions) {
      permissionsData = {
        set: permissions.map((permissionId) => ({ id: permissionId })),
      };
    }

    const userUpdate = await this.prisma.user.update({
      where: { id },
      data: {
        role,
        permissions: permissionsData,
      },
      include: { permissions: true },
    });

    await this.auditLogService.log(id, 'User', 'UPDATE', oldUser, userUpdate);
    return { message: 'User updated successfully', userUpdate };
  }

  async batchUpdateUsers(ids: string[], updateUserDto: UpdateUserDto) {
    const updatePromises = ids.map(async (id) => {
      try {
        const oldUser = await this.prisma.user.findUnique({
          where: { id },
          include: { permissions: true },
        });

        if (!oldUser) {
          throw new NotFoundException(`User ${id} not found`);
        }

        const { photos, permissions, ...rest } = updateUserDto;
        const photoObjects =
          photos?.map((photo) => ({
            title: photo.title,
            src: photo.src,
          })) || oldUser.photos;

        const permissionsData = permissions
          ? { set: permissions.map((permissionId) => ({ id: permissionId })) }
          : undefined;

        const userUpdate = await this.prisma.user.update({
          where: { id },
          data: {
            ...rest,
            photos: photoObjects,
            permissions: permissionsData,
          },
          include: { permissions: true },
        });

        await this.auditLogService.log(
          id,
          'User',
          'UPDATE',
          oldUser,
          userUpdate,
        );
        return { message: `User ${id} updated successfully`, userUpdate };
      } catch (error) {
        console.error(`Error updating user ${id}:`, error);
        throw new InternalServerErrorException(`Failed to update user ${id}`);
      }
    });

    try {
      const results = await Promise.all(updatePromises);
      return { message: 'All users updated successfully', results };
    } catch (error) {
      console.error('Error updating multiple users:', error);
      throw new InternalServerErrorException('Failed to update multiple users');
    }
  }

  async updateUserAdmin(
    id: string,
    updateUserDto: UpdateUserDto,
  ): Promise<any> {
    const oldUser = await this.prisma.user.findUnique({
      where: { id },
      include: { permissions: true },
    });
    if (!oldUser) {
      throw new NotFoundException('User not found');
    }

    const { photos, permissions, ...rest } = updateUserDto;
    const photoObjects =
      photos?.map((photo) => ({ title: photo.title, src: photo.src })) ||
      oldUser.photos;

    const permissionsData = permissions
      ? { set: permissions.map((permissionId) => ({ id: permissionId })) }
      : undefined;

    const updatedUser = await this.prisma.user.update({
      where: { id },
      data: {
        ...rest,
        photos: photoObjects,
        permissions: permissionsData,
      },
      include: { permissions: true },
    });

    await this.auditLogService.log(id, 'User', 'UPDATE', oldUser, updatedUser);
    return { message: 'Admin user updated successfully', user: updatedUser };
  }
}
