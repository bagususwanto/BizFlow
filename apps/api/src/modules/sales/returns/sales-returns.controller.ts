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
import { SalesReturnsService } from './sales-returns.service';
import {
  CreateSalesReturnDto,
  UpdateSalesReturnDto,
  UpdateSalesReturnStatusDto,
  QuerySalesReturnsDto,
} from './dto';
import { Prisma } from '@bizflow/database';

@Controller('sales/returns')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class SalesReturnsController {
  constructor(private readonly salesReturnsService: SalesReturnsService) {}

  @Get()
  @Permissions(Permission.SalesReturns.Read)
  async findAll(
    @Query() query: QuerySalesReturnsDto,
  ): Promise<
    ApiResponse<Prisma.SalesReturnGetPayload<object>[]> & { summary?: any }
  > {
    return this.salesReturnsService.findAll(query);
  }

  @Get('generate-return-number')
  @Permissions(Permission.SalesReturns.Read)
  async generateReturnNumber() {
    const returnNumber = await this.salesReturnsService.generateReturnNumber();
    return { data: { returnNumber } };
  }

  @Get(':id')
  @Permissions(Permission.SalesReturns.Read)
  async findById(
    @Param('id') id: string,
  ): Promise<ApiResponse<Prisma.SalesReturnGetPayload<object>>> {
    return this.salesReturnsService.findById(id);
  }

  @Post()
  @Permissions(Permission.SalesReturns.Create as PermissionType)
  @UseInterceptors(AuditLogInterceptor)
  @AuditLog({
    module: Module.SALES_RETURNS,
    action: AuditAction.CREATE,
    entityType: 'sales_return',
  })
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body() dto: CreateSalesReturnDto,
    @CurrentUser() user: JwtPayload,
  ): Promise<ApiResponse<Prisma.SalesReturnGetPayload<object>>> {
    return this.salesReturnsService.create(dto, user.sub);
  }

  @Patch(':id')
  @Permissions(Permission.SalesReturns.Update as PermissionType)
  @UseInterceptors(AuditLogInterceptor)
  @AuditLog({
    module: Module.SALES_RETURNS,
    action: AuditAction.UPDATE,
    entityType: 'sales_return',
  })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateSalesReturnDto,
    @CurrentUser() user: JwtPayload,
  ): Promise<ApiResponse<Prisma.SalesReturnGetPayload<object>>> {
    return this.salesReturnsService.update(id, dto, user.sub);
  }

  @Patch(':id/status')
  @Permissions(
    Permission.SalesReturns.Update as PermissionType,
    Permission.SalesReturns.Approve as PermissionType,
    Permission.SalesReturns.Reject as PermissionType,
  )
  @UseInterceptors(AuditLogInterceptor)
  @AuditLog({
    module: Module.SALES_RETURNS,
    action: AuditAction.UPDATE,
    entityType: 'sales_return_status',
  })
  async updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateSalesReturnStatusDto,
    @CurrentUser() user: JwtPayload,
  ): Promise<ApiResponse<Prisma.SalesReturnGetPayload<object>>> {
    return this.salesReturnsService.updateStatus(
      id,
      dto,
      user.sub,
      user.permissions,
    );
  }

  @Delete(':id')
  @Permissions(Permission.SalesReturns.Delete as PermissionType)
  @UseInterceptors(AuditLogInterceptor)
  @AuditLog({
    module: Module.SALES_RETURNS,
    action: AuditAction.DELETE,
    entityType: 'sales_return',
  })
  @HttpCode(HttpStatus.OK)
  async delete(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.salesReturnsService.delete(id, user.sub);
  }

  @Post('bulk-delete')
  @Permissions(Permission.SalesReturns.Delete as PermissionType)
  @UseInterceptors(AuditLogInterceptor)
  @AuditLog({
    module: Module.SALES_RETURNS,
    action: AuditAction.DELETE,
    entityType: 'sales_return (bulk)',
  })
  @HttpCode(HttpStatus.OK)
  async bulkDelete(
    @Body() body: { ids: string[] },
    @CurrentUser() user: JwtPayload,
  ) {
    return this.salesReturnsService.bulkDelete(body.ids, user.sub);
  }
}
