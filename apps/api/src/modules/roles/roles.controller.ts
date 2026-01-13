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
} from '@nestjs/common';

import { JwtAuthGuard, PermissionsGuard } from '../../common/guards';
import { CurrentUser, Permissions } from '../../common/decorators';
import type { JwtPayload } from '../auth/strategies/jwt.strategy';

import { RolesService } from './roles.service';
import { CreateRoleDto, UpdateRoleDto, QueryRolesDto } from './dto';
import {
  Permission,
  type PermissionType,
  Module,
  AuditAction,
} from '@bizflow/types';
import { AuditLog } from '../../common/decorators/audit-log.decorator';
import { AuditLogInterceptor } from '../../common/interceptors/audit-log.interceptor';
import { UseInterceptors } from '@nestjs/common';

@Controller('roles')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  /**
   * Get all roles with pagination, filter, and summary
   */
  @Get()
  @Permissions(Permission.Users.Read)
  async findAll(@Query() query: QueryRolesDto) {
    return this.rolesService.findAll(query);
  }

  /**
   * Get available permissions (modules and actions)
   */
  @Get('permissions')
  @Permissions(Permission.Users.Read)
  getAvailablePermissions() {
    return this.rolesService.getAllPermissions();
  }

  /**
   * Get a single role by ID
   */
  @Get(':id')
  @Permissions(Permission.Users.Read)
  async findById(@Param('id') id: string) {
    return this.rolesService.findById(id);
  }

  /**
   * Create a new role
   */
  @Post()
  @Permissions(Permission.Users.Create as PermissionType)
  @UseInterceptors(AuditLogInterceptor)
  @AuditLog({
    module: Module.ROLES,
    action: AuditAction.CREATE,
    entityType: 'role',
  })
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() dto: CreateRoleDto, @CurrentUser() user: JwtPayload) {
    return this.rolesService.create(dto, user.sub);
  }

  /**
   * Update an existing role
   */
  @Patch(':id')
  @Permissions(Permission.Users.Update)
  @UseInterceptors(AuditLogInterceptor)
  @AuditLog({
    module: Module.ROLES,
    action: AuditAction.UPDATE,
    entityType: 'role',
  })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateRoleDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.rolesService.update(id, dto, user.sub);
  }

  /**
   * Delete a role
   */
  @Delete(':id')
  @Permissions(Permission.Users.Delete as PermissionType)
  @UseInterceptors(AuditLogInterceptor)
  @AuditLog({
    module: Module.ROLES,
    action: AuditAction.DELETE,
    entityType: 'role',
  })
  @HttpCode(HttpStatus.OK)
  async delete(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.rolesService.delete(id, user.sub);
  }
}
