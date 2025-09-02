import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { NotificationService } from './notification.service';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBearerAuth,
} from '@nestjs/swagger';
import {
  CreateNotificationDto,
  UpdateNotificationStatusDto,
} from './dto/create-notification.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AdminRoleGuard } from '../auth/AdminRoleGuard';

@ApiTags('Notifications')
@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Post()
  @UseGuards(AdminRoleGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new notification' })
  @ApiResponse({
    status: 201,
    description: 'Notification successfully created.',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  async create(@Body() createNotificationDto: CreateNotificationDto) {
    return this.notificationService.createNotification(createNotificationDto);
  }

  @Get()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all notifications' })
  @ApiResponse({ status: 200, description: 'Return all notifications.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  async findAll(
    @Query('page') page: number = 1,
    @Query('perPage') perPage: number = 10,
    @Query('email') email?: string,
    @Query('status') status?: string,
  ) {
    return this.notificationService.findAll(page, perPage, email, status);
  }

  @Get(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get a notification by ID' })
  @ApiParam({ name: 'id', description: 'ID of the notification to retrieve' })
  @ApiResponse({ status: 200, description: 'Return the notification.' })
  @ApiResponse({ status: 404, description: 'Notification not found.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  findOne(@Param('id') id: string) {
    return this.notificationService.findOne(id);
  }

  @Get('user/:email')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get all notifications for a specific user by email',
  })
  @ApiParam({
    name: 'email',
    description: 'Email of the user to retrieve notifications for',
  })
  @ApiResponse({
    status: 200,
    description: 'List of notifications for the user.',
  })
  @ApiResponse({ status: 404, description: 'User not found.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  async getNotificationsByEmail(@Param('email') email: string) {
    return this.notificationService.getNotificationsForUserByEmail(email);
  }

  @Patch(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update notification status (read/unread)' })
  @ApiParam({ name: 'id', description: 'ID of the notification to update' })
  @ApiResponse({
    status: 200,
    description: 'Notification status successfully updated.',
  })
  @ApiResponse({ status: 404, description: 'Notification not found.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  async updateStatus(
    @Param('id') id: string,
    @Body() updateStatusDto: UpdateNotificationStatusDto,
  ) {
    return this.notificationService.updateNotificationStatus(
      id,
      updateStatusDto,
    );
  }

  @Delete(':id')
  @UseGuards(AdminRoleGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a notification' })
  @ApiParam({ name: 'id', description: 'ID of the notification to delete' })
  @ApiResponse({
    status: 200,
    description: 'The notification has been successfully deleted.',
  })
  @ApiResponse({ status: 404, description: 'Notification not found.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  async remove(@Param('id') id: string) {
    return this.notificationService.remove(id);
  }
}
