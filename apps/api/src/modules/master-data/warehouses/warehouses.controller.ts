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
  PermissionType,
  Module,
  AuditAction,
  ApiResponse,
} from '@bizflow/types';
import { WarehousesService } from './warehouses.service';
import {
  CreateWarehouseDto,
  UpdateWarehouseDto,
  QueryWarehousesDto,
} from './dto';
import { Prisma } from '@bizflow/database';

@Controller('master-data/warehouses')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class WarehousesController {
  constructor(private readonly warehousesService: WarehousesService) {}

  @Get()
  @Permissions(Permission.Warehouses.Read)
  async findAll(
    @Query() query: QueryWarehousesDto,
  ): Promise<
    ApiResponse<Prisma.WarehouseGetPayload<object>[]> & { summary?: any }
  > {
    return this.warehousesService.findAll(query);
  }

  @Get('list/active')
  @Permissions(Permission.Warehouses.Read)
  async findActiveList() {
    return this.warehousesService.findActiveList();
  }

  @Get('generate-code')
  @Permissions(Permission.Warehouses.Read)
  async generateCode() {
    const code = await this.warehousesService.generateCode();
    return { data: { code } };
  }

  @Get(':id')
  @Permissions(Permission.Warehouses.Read)
  async findById(
    @Param('id') id: string,
  ): Promise<ApiResponse<Prisma.WarehouseGetPayload<object>>> {
    return this.warehousesService.findById(id);
  }

  @Post()
  @Permissions(Permission.Warehouses.Create as PermissionType)
  @UseInterceptors(AuditLogInterceptor)
  @AuditLog({
    module: Module.WAREHOUSES,
    action: AuditAction.CREATE,
    entityType: 'warehouse',
  })
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body() dto: CreateWarehouseDto,
    @CurrentUser() user: JwtPayload,
  ): Promise<ApiResponse<Prisma.WarehouseGetPayload<object>>> {
    return this.warehousesService.create(dto, user.sub);
  }

  @Patch(':id')
  @Permissions(Permission.Warehouses.Update as PermissionType)
  @UseInterceptors(AuditLogInterceptor)
  @AuditLog({
    module: Module.WAREHOUSES,
    action: AuditAction.UPDATE,
    entityType: 'warehouse',
  })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateWarehouseDto,
    @CurrentUser() user: JwtPayload,
  ): Promise<ApiResponse<Prisma.WarehouseGetPayload<object>>> {
    return this.warehousesService.update(id, dto, user.sub);
  }

  @Delete(':id')
  @Permissions(Permission.Warehouses.Delete as PermissionType)
  @UseInterceptors(AuditLogInterceptor)
  @AuditLog({
    module: Module.WAREHOUSES,
    action: AuditAction.DELETE,
    entityType: 'warehouse',
  })
  @HttpCode(HttpStatus.OK)
  async delete(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.warehousesService.delete(id, user.sub);
  }

  @Post('bulk-delete')
  @Permissions(Permission.Warehouses.Delete as PermissionType)
  @UseInterceptors(AuditLogInterceptor)
  @AuditLog({
    module: Module.WAREHOUSES,
    action: AuditAction.DELETE,
    entityType: 'warehouse (bulk)',
  })
  @HttpCode(HttpStatus.OK)
  async bulkDelete(
    @Body() body: { ids: string[] },
    @CurrentUser() user: JwtPayload,
  ) {
    return this.warehousesService.bulkDelete(body.ids, user.sub);
  }
}
