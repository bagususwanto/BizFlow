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
import { PurchaseOrdersService } from './purchase-orders.service';
import {
  CreatePurchaseOrderDto,
  UpdatePurchaseOrderDto,
  QueryPurchaseOrdersDto,
  UpdatePurchaseOrderStatusDto,
  AutoReorderDto,
} from './dto';
import { Prisma } from '@bizflow/database';

@Controller('purchases/orders')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class PurchaseOrdersController {
  constructor(private readonly purchaseOrdersService: PurchaseOrdersService) {}

  @Get()
  @Permissions(Permission.PurchaseOrders.Read)
  async findAll(
    @Query() query: QueryPurchaseOrdersDto,
  ): Promise<
    ApiResponse<Prisma.PurchaseOrderGetPayload<object>[]> & { summary?: any }
  > {
    return this.purchaseOrdersService.findAll(query);
  }

  @Get('generate-order-number')
  @Permissions(Permission.PurchaseOrders.Read)
  async generateOrderNumber() {
    const orderNumber = await this.purchaseOrdersService.generateOrderNumber();
    return { data: { orderNumber } };
  }

  @Post('auto-reorder/preview')
  @Permissions(Permission.PurchaseOrders.Read)
  @HttpCode(HttpStatus.OK)
  async previewAutoReorder(@Body() dto: AutoReorderDto) {
    const result = await this.purchaseOrdersService.previewAutoReorder(
      dto.variantIds,
    );
    return { data: result };
  }

  @Post('auto-reorder/execute')
  @Permissions(Permission.PurchaseOrders.Create as PermissionType)
  @UseInterceptors(AuditLogInterceptor)
  @AuditLog({
    module: Module.PURCHASE_ORDERS,
    action: AuditAction.CREATE,
    entityType: 'purchase_order (auto_reorder)',
  })
  @HttpCode(HttpStatus.CREATED)
  async executeAutoReorder(
    @Body() dto: AutoReorderDto,
    @CurrentUser() user: JwtPayload,
  ) {
    const result = await this.purchaseOrdersService.executeAutoReorder(
      dto.variantIds,
      user.sub,
    );
    return { data: result };
  }

  @Get(':id')
  @Permissions(Permission.PurchaseOrders.Read)
  async findById(
    @Param('id') id: string,
  ): Promise<ApiResponse<Prisma.PurchaseOrderGetPayload<object>>> {
    return this.purchaseOrdersService.findById(id);
  }

  @Post()
  @Permissions(Permission.PurchaseOrders.Create as PermissionType)
  @UseInterceptors(AuditLogInterceptor)
  @AuditLog({
    module: Module.PURCHASE_ORDERS,
    action: AuditAction.CREATE,
    entityType: 'purchase_order',
  })
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body() dto: CreatePurchaseOrderDto,
    @CurrentUser() user: JwtPayload,
  ): Promise<ApiResponse<Prisma.PurchaseOrderGetPayload<object>>> {
    return this.purchaseOrdersService.create(dto, user.sub);
  }

  @Patch(':id')
  @Permissions(Permission.PurchaseOrders.Update as PermissionType)
  @UseInterceptors(AuditLogInterceptor)
  @AuditLog({
    module: Module.PURCHASE_ORDERS,
    action: AuditAction.UPDATE,
    entityType: 'purchase_order',
  })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdatePurchaseOrderDto,
    @CurrentUser() user: JwtPayload,
  ): Promise<ApiResponse<Prisma.PurchaseOrderGetPayload<object>>> {
    return this.purchaseOrdersService.update(id, dto, user.sub);
  }

  @Patch(':id/status')
  @Permissions(Permission.PurchaseOrders.Update as PermissionType)
  @UseInterceptors(AuditLogInterceptor)
  @AuditLog({
    module: Module.PURCHASE_ORDERS,
    action: AuditAction.UPDATE,
    entityType: 'purchase_order_status',
  })
  async updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdatePurchaseOrderStatusDto,
    @CurrentUser() user: JwtPayload,
  ): Promise<ApiResponse<Prisma.PurchaseOrderGetPayload<object>>> {
    return this.purchaseOrdersService.updateStatus(id, dto, user.sub);
  }

  @Delete(':id')
  @Permissions(Permission.PurchaseOrders.Delete as PermissionType)
  @UseInterceptors(AuditLogInterceptor)
  @AuditLog({
    module: Module.PURCHASE_ORDERS,
    action: AuditAction.DELETE,
    entityType: 'purchase_order',
  })
  @HttpCode(HttpStatus.OK)
  async delete(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.purchaseOrdersService.delete(id, user.sub);
  }

  @Post('bulk-delete')
  @Permissions(Permission.PurchaseOrders.Delete as PermissionType)
  @UseInterceptors(AuditLogInterceptor)
  @AuditLog({
    module: Module.PURCHASE_ORDERS,
    action: AuditAction.DELETE,
    entityType: 'purchase_order (bulk)',
  })
  @HttpCode(HttpStatus.OK)
  async bulkDelete(
    @Body() body: { ids: string[] },
    @CurrentUser() user: JwtPayload,
  ) {
    return this.purchaseOrdersService.bulkDelete(body.ids, user.sub);
  }
}
