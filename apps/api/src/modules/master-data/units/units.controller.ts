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
import type { JwtPayload } from '../../core/auth/strategies/jwt.strategy';
import {
  Permission,
  type PermissionType,
  Module,
  AuditAction,
} from '@bizflow/types';

import { UnitsService } from './units.service';
import { CreateUnitDto, UpdateUnitDto, QueryUnitsDto } from './dto';

@Controller('master-data/units')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class UnitsController {
  constructor(private readonly unitsService: UnitsService) {}

  @Get()
  @Permissions(Permission.Units.Read)
  async findAll(@Query() query: QueryUnitsDto) {
    return this.unitsService.findAll(query);
  }

  @Get('list/active')
  @Permissions(Permission.Units.Read)
  async findActiveList() {
    return this.unitsService.findActiveList();
  }

  @Get(':id')
  @Permissions(Permission.Units.Read)
  async findById(@Param('id') id: string) {
    return this.unitsService.findById(id);
  }

  @Post()
  @Permissions(Permission.Units.Create as PermissionType)
  @UseInterceptors(AuditLogInterceptor)
  @AuditLog({
    module: Module.UNITS,
    action: AuditAction.CREATE,
    entityType: 'unit',
  })
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() dto: CreateUnitDto, @CurrentUser() user: JwtPayload) {
    return this.unitsService.create(dto, user.sub);
  }

  @Patch(':id')
  @Permissions(Permission.Units.Update as PermissionType)
  @UseInterceptors(AuditLogInterceptor)
  @AuditLog({
    module: Module.UNITS,
    action: AuditAction.UPDATE,
    entityType: 'unit',
  })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateUnitDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.unitsService.update(id, dto, user.sub);
  }

  @Delete(':id')
  @Permissions(Permission.Units.Delete as PermissionType)
  @UseInterceptors(AuditLogInterceptor)
  @AuditLog({
    module: Module.UNITS,
    action: AuditAction.DELETE,
    entityType: 'unit',
  })
  @HttpCode(HttpStatus.OK)
  async delete(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.unitsService.delete(id, user.sub);
  }

  @Post('bulk-delete')
  @Permissions(Permission.Units.Delete as PermissionType)
  @UseInterceptors(AuditLogInterceptor)
  @AuditLog({
    module: Module.UNITS,
    action: AuditAction.DELETE,
    entityType: 'unit (bulk)',
  })
  @HttpCode(HttpStatus.OK)
  async bulkDelete(
    @Body() body: { ids: string[] },
    @CurrentUser() user: JwtPayload,
  ) {
    return this.unitsService.bulkDelete(body.ids, user.sub);
  }
}
