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
import {
  Permission,
  type PermissionType,
  Module,
  AuditAction,
} from '@bizflow/types';

import { OutletsService } from './outlets.service';
import { CreateOutletDto, UpdateOutletDto, QueryOutletsDto } from './dto';

@Controller('core/outlets')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class OutletsController {
  constructor(private readonly outletsService: OutletsService) {
    // Inject service
  }

  /**
   * Get all outlets with pagination, filter, and summary
   */
  @Get()
  @Permissions(Permission.Outlets.Read)
  async findAll(@Query() query: QueryOutletsDto) {
    return this.outletsService.findAll(query);
  }

  /**
   * Get active outlets for dropdown/select
   */
  @Get('list/active')
  @Permissions(Permission.Outlets.Read)
  async findActiveList() {
    return this.outletsService.findActiveList();
  }

  /**
   * Generate unique outlet code
   */
  @Get('generate-code')
  @Permissions(Permission.Outlets.Create as PermissionType)
  async generateCode() {
    const code = await this.outletsService.generateCode();
    return { data: code };
  }

  /**
   * Get a single outlet by ID
   */
  @Get(':id')
  @Permissions(Permission.Outlets.Read)
  async findById(@Param('id') id: string) {
    return this.outletsService.findById(id);
  }

  /**
   * Create a new outlet
   */
  @Post()
  @Permissions(Permission.Outlets.Create as PermissionType)
  @UseInterceptors(AuditLogInterceptor)
  @AuditLog({
    module: Module.OUTLETS,
    action: AuditAction.CREATE,
    entityType: 'outlet',
  })
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() dto: CreateOutletDto, @CurrentUser() user: JwtPayload) {
    return this.outletsService.create(dto, user.sub);
  }

  /**
   * Update an existing outlet
   */
  @Patch(':id')
  @Permissions(Permission.Outlets.Update as PermissionType)
  @UseInterceptors(AuditLogInterceptor)
  @AuditLog({
    module: Module.OUTLETS,
    action: AuditAction.UPDATE,
    entityType: 'outlet',
  })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateOutletDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.outletsService.update(id, dto, user.sub);
  }

  /**
   * Delete an outlet
   */
  @Delete(':id')
  @Permissions(Permission.Outlets.Delete as PermissionType)
  @UseInterceptors(AuditLogInterceptor)
  @AuditLog({
    module: Module.OUTLETS,
    action: AuditAction.DELETE,
    entityType: 'outlet',
  })
  @HttpCode(HttpStatus.OK)
  async delete(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.outletsService.delete(id, user.sub);
  }

  /**
   * Bulk delete outlets
   */
  @Post('bulk-delete')
  @Permissions(Permission.Outlets.Delete as PermissionType)
  @UseInterceptors(AuditLogInterceptor)
  @AuditLog({
    module: Module.OUTLETS,
    action: AuditAction.DELETE,
    entityType: 'outlet (bulk)',
  })
  @HttpCode(HttpStatus.OK)
  async bulkDelete(
    @Body() body: { ids: string[] },
    @CurrentUser() user: JwtPayload,
  ) {
    return this.outletsService.bulkDelete(body.ids, user.sub);
  }
}
