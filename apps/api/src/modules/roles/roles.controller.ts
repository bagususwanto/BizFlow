import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';

import { JwtAuthGuard, PermissionsGuard } from '../../common/guards';
import { CurrentUser, Permissions } from '../../common/decorators';
import type { JwtPayload } from '../auth/strategies/jwt.strategy';

import { RolesService } from './roles.service';
import { CreateRoleDto, UpdateRoleDto } from './dto';

@Controller('roles')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  /**
   * Get all roles
   */
  @Get()
  @Permissions('users:read')
  async findAll() {
    return this.rolesService.findAll();
  }

  /**
   * Get available permissions (modules and actions)
   */
  @Get('permissions')
  @Permissions('users:read')
  getAvailablePermissions() {
    return this.rolesService.getAllPermissions();
  }

  /**
   * Get a single role by ID
   */
  @Get(':id')
  @Permissions('users:read')
  async findById(@Param('id') id: string) {
    return this.rolesService.findById(id);
  }

  /**
   * Create a new role
   */
  @Post()
  @Permissions('users:create')
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() dto: CreateRoleDto, @CurrentUser() user: JwtPayload) {
    return this.rolesService.create(dto, user.sub);
  }

  /**
   * Update an existing role
   */
  @Patch(':id')
  @Permissions('users:update')
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
  @Permissions('users:delete')
  @HttpCode(HttpStatus.OK)
  async delete(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.rolesService.delete(id, user.sub);
  }
}
