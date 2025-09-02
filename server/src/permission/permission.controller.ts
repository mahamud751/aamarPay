import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { PermissionService } from './permission.service';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { UpdatePermissionDto } from './dto/update-permission.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AdminRoleGuard } from '../auth/AdminRoleGuard';

@ApiTags('permissions')
@Controller('permissions')
@UseGuards(JwtAuthGuard, AdminRoleGuard)
export class PermissionController {
  constructor(private readonly permissionService: PermissionService) {}

  @Post()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new permission' })
  @ApiResponse({
    status: 201,
    description: 'The permission has been successfully created.',
  })
  @ApiResponse({ status: 400, description: 'Invalid input.' })
  create(@Body() createPermissionDto: CreatePermissionDto) {
    return this.permissionService.create(createPermissionDto);
  }

  @Get()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all permissions' })
  @ApiResponse({ status: 200, description: 'Return all permissions.' })
  async findAll(
    @Query('page') page: number = 1,
    @Query('perPage') perPage: number = 10,
  ) {
    return this.permissionService.findAll(page, perPage);
  }

  @Get(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get a permission by ID' })
  @ApiParam({ name: 'id', description: 'ID of the permission to retrieve' })
  @ApiResponse({ status: 200, description: 'Return the permission.' })
  @ApiResponse({ status: 404, description: 'Permission not found.' })
  findOne(@Param('id') id: string) {
    return this.permissionService.findOne(id);
  }

  @Get(':id/user')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get a permission for user by ID' })
  @ApiParam({ name: 'id', description: 'ID of the permission to retrieve' })
  @ApiResponse({ status: 200, description: 'Return the permission for user.' })
  @ApiResponse({ status: 404, description: 'Permission not found.' })
  findOneForUser(@Param('id') id: string) {
    return this.permissionService.findOne(id);
  }

  @Patch(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a permission' })
  @ApiParam({ name: 'id', description: 'ID of the permission to update' })
  @ApiResponse({
    status: 200,
    description: 'The permission has been successfully updated.',
  })
  @ApiResponse({ status: 404, description: 'Permission not found.' })
  update(
    @Param('id') id: string,
    @Body() updatePermissionDto: UpdatePermissionDto,
  ) {
    return this.permissionService.update(id, updatePermissionDto);
  }

  @Delete(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a permission' })
  @ApiParam({ name: 'id', description: 'ID of the permission to delete' })
  @ApiResponse({
    status: 200,
    description: 'The permission has been successfully deleted.',
  })
  @ApiResponse({ status: 404, description: 'Permission not found.' })
  remove(@Param('id') id: string) {
    return this.permissionService.remove(id);
  }
}
