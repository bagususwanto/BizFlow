import {
  Controller,
  Get,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';

import { JwtAuthGuard, PermissionsGuard } from '../../../common/guards';
import { CurrentUser } from '../../../common/decorators';
import { Permissions } from '../../../common/decorators/permissions.decorator';
import { AuditLog } from '../../../common/decorators/audit-log.decorator';
import { AuditLogInterceptor } from '../../../common/interceptors/audit-log.interceptor';
import type { JwtPayload } from '../auth/strategies/jwt.strategy';
import {
  Permission,
  type PermissionType,
  Module,
  AuditAction,
} from '@bizflow/types';

import { SettingsService } from './settings.service';
import { QuerySettingsDto, UpdateSettingsDto } from './dto';

@Controller('core/settings')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  /**
   * Get all settings with optional category filter
   */
  @Get()
  @Permissions(Permission.Settings.Read)
  async findAll(@Query() query: QuerySettingsDto) {
    return this.settingsService.findAll(query);
  }

  /**
   * Get settings grouped by category
   */
  @Get('grouped')
  @Permissions(Permission.Settings.Read)
  async findGrouped() {
    return this.settingsService.findGroupedByCategory();
  }

  /**
   * Get a single setting by key
   */
  @Get(':key')
  @Permissions(Permission.Settings.Read)
  async findByKey(@Param('key') key: string) {
    return this.settingsService.findByKey(key);
  }

  /**
   * Batch update settings
   */
  @Patch()
  @Permissions(Permission.Settings.Update as PermissionType)
  @UseInterceptors(AuditLogInterceptor)
  @AuditLog({
    module: Module.SETTINGS,
    action: AuditAction.UPDATE,
    entityType: 'settings',
  })
  async updateBatch(
    @Body() dto: UpdateSettingsDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.settingsService.updateBatch(dto, user.sub);
  }
}
