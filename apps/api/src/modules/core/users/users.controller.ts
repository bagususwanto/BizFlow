import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
  UseInterceptors,
} from '@nestjs/common';

import { JwtAuthGuard, PermissionsGuard } from '../../../common/guards';
import { CurrentUser } from '../../../common/decorators';
import { Permissions } from '../../../common/decorators/permissions.decorator';
import { AuditLog } from '../../../common/decorators/audit-log.decorator';
import { AuditLogInterceptor } from '../../../common/interceptors/audit-log.interceptor';
import type { JwtPayload } from '../auth/strategies/jwt.strategy';

import { UsersService } from './users.service';
import {
  CreateUserDto,
  UpdateUserDto,
  QueryUsersDto,
  AdminResetPasswordDto,
  ChangePinDto,
} from './dto';

import {
  Permission,
  type PermissionType,
  Module,
  AuditAction,
} from '@bizflow/types';

@Controller('core/users')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  /**
   * Get all users with pagination and filters
   */
  @Get()
  @Permissions(Permission.Users.Read)
  async findAll(@Query() query: QueryUsersDto) {
    return this.usersService.findAll(query);
  }

  /**
   * Get a single user by ID
   */
  @Get(':id')
  @Permissions(Permission.Users.Read)
  async findById(@Param('id') id: string) {
    return this.usersService.findById(id);
  }

  /**
   * Create a new user
   */
  @Post()
  @Permissions(Permission.Users.Create as PermissionType)
  @UseInterceptors(AuditLogInterceptor)
  @AuditLog({
    module: Module.USERS,
    action: AuditAction.CREATE,
    entityType: 'user',
  })
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() dto: CreateUserDto, @CurrentUser() user: JwtPayload) {
    return this.usersService.create(dto, user.sub);
  }

  /**
   * Update an existing user
   */
  @Patch(':id')
  @Permissions(Permission.Users.Update as PermissionType)
  @UseInterceptors(AuditLogInterceptor)
  @AuditLog({
    module: Module.USERS,
    action: AuditAction.UPDATE,
    entityType: 'user',
  })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateUserDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.usersService.update(id, dto, user.sub);
  }

  /**
   * Deactivate a user (soft delete)
   */
  @Delete(':id')
  @Permissions(Permission.Users.Delete as PermissionType)
  @UseInterceptors(AuditLogInterceptor)
  @AuditLog({
    module: Module.USERS,
    action: AuditAction.DELETE,
    entityType: 'user',
  })
  @HttpCode(HttpStatus.OK)
  async delete(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.usersService.delete(id, user.sub);
  }

  /**
   * Admin reset password for a user
   */
  @Patch(':id/password')
  @Permissions(Permission.Users.Update as PermissionType)
  @UseInterceptors(AuditLogInterceptor)
  @AuditLog({
    module: Module.USERS,
    action: AuditAction.UPDATE,
    entityType: 'user_password',
  })
  async resetPassword(
    @Param('id') id: string,
    @Body() dto: AdminResetPasswordDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.usersService.resetPassword(id, dto, user.sub);
  }

  /**
   * Change or set PIN for a user
   */
  @Patch(':id/pin')
  @Permissions(Permission.Users.Update as PermissionType)
  @UseInterceptors(AuditLogInterceptor)
  @AuditLog({
    module: Module.USERS,
    action: AuditAction.UPDATE,
    entityType: 'user_pin',
  })
  async changePin(
    @Param('id') id: string,
    @Body() dto: ChangePinDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.usersService.changePin(id, dto, user.sub);
  }

  /**
   * Bulk deactivate users
   */
  @Post('bulk-delete')
  @Permissions(Permission.Users.Delete as PermissionType)
  @UseInterceptors(AuditLogInterceptor)
  @AuditLog({
    module: Module.USERS,
    action: AuditAction.DELETE,
    entityType: 'user (bulk)',
  })
  @HttpCode(HttpStatus.OK)
  async bulkDelete(
    @Body() body: { ids: string[] },
    @CurrentUser() user: JwtPayload,
  ) {
    return this.usersService.bulkDelete(body.ids, user.sub);
  }
}
