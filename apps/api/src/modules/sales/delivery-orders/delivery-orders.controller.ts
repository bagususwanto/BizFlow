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
import { DeliveryOrdersService } from './delivery-orders.service';
import {
  CreateDeliveryOrderDto,
  UpdateDeliveryOrderDto,
  QueryDeliveryOrdersDto,
  UpdateDeliveryStatusDto,
} from './dto';
import { Prisma } from '@bizflow/database';

@Controller('sales/delivery-orders')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class DeliveryOrdersController {
  constructor(
    private readonly deliveryOrdersService: DeliveryOrdersService,
  ) {}

  @Get()
  @Permissions(Permission.DeliveryOrders.Read)
  async findAll(
    @Query() query: QueryDeliveryOrdersDto,
  ): Promise<
    ApiResponse<Prisma.DeliveryOrderGetPayload<object>[]> & { summary?: any }
  > {
    return this.deliveryOrdersService.findAll(query);
  }

  @Get('generate-delivery-number')
  @Permissions(Permission.DeliveryOrders.Read)
  async generateDeliveryNumber() {
    const deliveryNumber =
      await this.deliveryOrdersService.generateDeliveryNumber();
    return { data: { deliveryNumber } };
  }

  @Get(':id')
  @Permissions(Permission.DeliveryOrders.Read)
  async findById(
    @Param('id') id: string,
  ): Promise<ApiResponse<Prisma.DeliveryOrderGetPayload<object>>> {
    return this.deliveryOrdersService.findById(id);
  }

  @Post()
  @Permissions(Permission.DeliveryOrders.Create as PermissionType)
  @UseInterceptors(AuditLogInterceptor)
  @AuditLog({
    module: Module.DELIVERY_ORDERS,
    action: AuditAction.CREATE,
    entityType: 'delivery_order',
  })
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body() dto: CreateDeliveryOrderDto,
    @CurrentUser() user: JwtPayload,
  ): Promise<ApiResponse<Prisma.DeliveryOrderGetPayload<object>>> {
    return this.deliveryOrdersService.create(dto, user.sub);
  }

  @Patch(':id')
  @Permissions(Permission.DeliveryOrders.Update as PermissionType)
  @UseInterceptors(AuditLogInterceptor)
  @AuditLog({
    module: Module.DELIVERY_ORDERS,
    action: AuditAction.UPDATE,
    entityType: 'delivery_order',
  })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateDeliveryOrderDto,
    @CurrentUser() user: JwtPayload,
  ): Promise<ApiResponse<Prisma.DeliveryOrderGetPayload<object>>> {
    return this.deliveryOrdersService.update(id, dto, user.sub);
  }

  @Patch(':id/status')
  @Permissions(Permission.DeliveryOrders.Update as PermissionType)
  @UseInterceptors(AuditLogInterceptor)
  @AuditLog({
    module: Module.DELIVERY_ORDERS,
    action: AuditAction.UPDATE,
    entityType: 'delivery_order_status',
  })
  async updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateDeliveryStatusDto,
    @CurrentUser() user: JwtPayload,
  ): Promise<ApiResponse<Prisma.DeliveryOrderGetPayload<object>>> {
    return this.deliveryOrdersService.updateStatus(id, dto, user.sub);
  }

  @Delete(':id')
  @Permissions(Permission.DeliveryOrders.Delete as PermissionType)
  @UseInterceptors(AuditLogInterceptor)
  @AuditLog({
    module: Module.DELIVERY_ORDERS,
    action: AuditAction.DELETE,
    entityType: 'delivery_order',
  })
  @HttpCode(HttpStatus.OK)
  async delete(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.deliveryOrdersService.delete(id, user.sub);
  }
}
