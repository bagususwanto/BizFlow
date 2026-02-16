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
import { SuppliersService } from './suppliers.service';
import { CreateSupplierDto, UpdateSupplierDto, QuerySuppliersDto } from './dto';
import { Prisma } from '@bizflow/database';

@Controller('master-data/suppliers')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class SuppliersController {
  constructor(private readonly suppliersService: SuppliersService) {}

  @Get()
  @Permissions(Permission.Suppliers.Read)
  async findAll(
    @Query() query: QuerySuppliersDto,
  ): Promise<
    ApiResponse<Prisma.SupplierGetPayload<object>[]> & { summary?: any }
  > {
    return this.suppliersService.findAll(query);
  }

  @Get('list/active')
  @Permissions(Permission.Suppliers.Read)
  async findActiveList() {
    return this.suppliersService.findActiveList();
  }

  @Get('generate-code')
  @Permissions(Permission.Suppliers.Read)
  async generateCode() {
    const code = await this.suppliersService.generateCode();
    return { data: { code } };
  }

  @Get(':id')
  @Permissions(Permission.Suppliers.Read)
  async findById(
    @Param('id') id: string,
  ): Promise<ApiResponse<Prisma.SupplierGetPayload<object>>> {
    return this.suppliersService.findById(id);
  }

  @Post()
  @Permissions(Permission.Suppliers.Create as PermissionType)
  @UseInterceptors(AuditLogInterceptor)
  @AuditLog({
    module: Module.SUPPLIERS,
    action: AuditAction.CREATE,
    entityType: 'supplier',
  })
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body() dto: CreateSupplierDto,
    @CurrentUser() user: JwtPayload,
  ): Promise<ApiResponse<Prisma.SupplierGetPayload<object>>> {
    return this.suppliersService.create(dto, user.sub);
  }

  @Patch(':id')
  @Permissions(Permission.Suppliers.Update as PermissionType)
  @UseInterceptors(AuditLogInterceptor)
  @AuditLog({
    module: Module.SUPPLIERS,
    action: AuditAction.UPDATE,
    entityType: 'supplier',
  })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateSupplierDto,
    @CurrentUser() user: JwtPayload,
  ): Promise<ApiResponse<Prisma.SupplierGetPayload<object>>> {
    return this.suppliersService.update(id, dto, user.sub);
  }

  @Delete(':id')
  @Permissions(Permission.Suppliers.Delete as PermissionType)
  @UseInterceptors(AuditLogInterceptor)
  @AuditLog({
    module: Module.SUPPLIERS,
    action: AuditAction.DELETE,
    entityType: 'supplier',
  })
  @HttpCode(HttpStatus.OK)
  async delete(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.suppliersService.delete(id, user.sub);
  }

  @Post('bulk-delete')
  @Permissions(Permission.Suppliers.Delete as PermissionType)
  @UseInterceptors(AuditLogInterceptor)
  @AuditLog({
    module: Module.SUPPLIERS,
    action: AuditAction.DELETE,
    entityType: 'supplier (bulk)',
  })
  @HttpCode(HttpStatus.OK)
  async bulkDelete(
    @Body() body: { ids: string[] },
    @CurrentUser() user: JwtPayload,
  ) {
    return this.suppliersService.bulkDelete(body.ids, user.sub);
  }
}
