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
import { SalesOrdersService } from './sales-orders.service';
import {
  CreateSalesOrderDto,
  UpdateSalesOrderDto,
  QuerySalesOrdersDto,
  UpdateSalesOrderStatusDto,
} from './dto';
import { Prisma } from '@bizflow/database';

@Controller('sales/orders')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class SalesOrdersController {
  constructor(private readonly salesOrdersService: SalesOrdersService) {}

  @Get()
  @Permissions(Permission.SalesOrders.Read)
  async findAll(
    @Query() query: QuerySalesOrdersDto,
  ): Promise<
    ApiResponse<Prisma.SalesOrderGetPayload<object>[]> & { summary?: any }
  > {
    return this.salesOrdersService.findAll(query);
  }

  @Get('generate-order-number')
  @Permissions(Permission.SalesOrders.Read)
  async generateOrderNumber() {
    const orderNumber = await this.salesOrdersService.generateOrderNumber();
    return { data: { orderNumber } };
  }

  @Get('customer/:customerId/history')
  @Permissions(Permission.SalesOrders.Read)
  async findByCustomer(
    @Param('customerId') customerId: string,
    @Query()
    query: {
      page?: number;
      pageSize?: number;
      sortBy?: string;
      sortOrder?: 'asc' | 'desc';
      status?: string;
      paymentStatus?: string;
      startDate?: string;
      endDate?: string;
    },
  ) {
    return this.salesOrdersService.findByCustomer(customerId, query);
  }

  @Get(':id')
  @Permissions(Permission.SalesOrders.Read)
  async findById(
    @Param('id') id: string,
  ): Promise<ApiResponse<Prisma.SalesOrderGetPayload<object>>> {
    return this.salesOrdersService.findById(id);
  }

  @Post()
  @Permissions(Permission.SalesOrders.Create as PermissionType)
  @UseInterceptors(AuditLogInterceptor)
  @AuditLog({
    module: Module.SALES_ORDERS,
    action: AuditAction.CREATE,
    entityType: 'sales_order',
  })
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body() dto: CreateSalesOrderDto,
    @CurrentUser() user: JwtPayload,
  ): Promise<ApiResponse<Prisma.SalesOrderGetPayload<object>>> {
    return this.salesOrdersService.create(dto, user.sub);
  }

  @Patch(':id')
  @Permissions(Permission.SalesOrders.Update as PermissionType)
  @UseInterceptors(AuditLogInterceptor)
  @AuditLog({
    module: Module.SALES_ORDERS,
    action: AuditAction.UPDATE,
    entityType: 'sales_order',
  })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateSalesOrderDto,
    @CurrentUser() user: JwtPayload,
  ): Promise<ApiResponse<Prisma.SalesOrderGetPayload<object>>> {
    return this.salesOrdersService.update(id, dto, user.sub);
  }

  @Patch(':id/status')
  @Permissions(
    Permission.SalesOrders.Update as PermissionType,
    Permission.SalesOrders.Confirm as PermissionType,
    Permission.SalesOrders.Cancel as PermissionType,
  )
  @UseInterceptors(AuditLogInterceptor)
  @AuditLog({
    module: Module.SALES_ORDERS,
    action: AuditAction.UPDATE,
    entityType: 'sales_order_status',
  })
  async updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateSalesOrderStatusDto,
    @CurrentUser() user: JwtPayload,
  ): Promise<ApiResponse<Prisma.SalesOrderGetPayload<object>>> {
    return this.salesOrdersService.updateStatus(id, dto, user.sub);
  }

  @Delete(':id')
  @Permissions(Permission.SalesOrders.Delete as PermissionType)
  @UseInterceptors(AuditLogInterceptor)
  @AuditLog({
    module: Module.SALES_ORDERS,
    action: AuditAction.DELETE,
    entityType: 'sales_order',
  })
  @HttpCode(HttpStatus.OK)
  async delete(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.salesOrdersService.delete(id, user.sub);
  }

  @Post('bulk-delete')
  @Permissions(Permission.SalesOrders.Delete as PermissionType)
  @UseInterceptors(AuditLogInterceptor)
  @AuditLog({
    module: Module.SALES_ORDERS,
    action: AuditAction.DELETE,
    entityType: 'sales_order (bulk)',
  })
  @HttpCode(HttpStatus.OK)
  async bulkDelete(
    @Body() body: { ids: string[] },
    @CurrentUser() user: JwtPayload,
  ) {
    return this.salesOrdersService.bulkDelete(body.ids, user.sub);
  }
}
