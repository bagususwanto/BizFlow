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
import { StockAdjustmentsService } from './stock-adjustments.service';
import {
  CreateStockAdjustmentDto,
  UpdateStockAdjustmentDto,
  UpdateStockAdjustmentStatusDto,
  QueryStockAdjustmentsDto,
} from './dto';
import { Prisma } from '@bizflow/database';

@Controller('inventory/adjustments')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class StockAdjustmentsController {
  constructor(
    private readonly stockAdjustmentsService: StockAdjustmentsService,
  ) {}

  @Get()
  @Permissions(Permission.StockAdjustments.Read)
  async findAll(@Query() query: QueryStockAdjustmentsDto): Promise<
    ApiResponse<Prisma.StockAdjustmentGetPayload<object>[]> & {
      summary?: any;
    }
  > {
    return this.stockAdjustmentsService.findAll(query);
  }

  @Get('generate-adjustment-number')
  @Permissions(Permission.StockAdjustments.Read)
  async generateAdjustmentNumber() {
    const adjustmentNumber =
      await this.stockAdjustmentsService.generateAdjustmentNumber();
    return { data: { adjustmentNumber } };
  }

  @Get(':id')
  @Permissions(Permission.StockAdjustments.Read)
  async findById(
    @Param('id') id: string,
  ): Promise<ApiResponse<Prisma.StockAdjustmentGetPayload<object>>> {
    return this.stockAdjustmentsService.findById(id);
  }

  @Post()
  @Permissions(Permission.StockAdjustments.Create as PermissionType)
  @UseInterceptors(AuditLogInterceptor)
  @AuditLog({
    module: Module.STOCK_ADJUSTMENTS,
    action: AuditAction.CREATE,
    entityType: 'stock_adjustment',
  })
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body() dto: CreateStockAdjustmentDto,
    @CurrentUser() user: JwtPayload,
  ): Promise<ApiResponse<Prisma.StockAdjustmentGetPayload<object>>> {
    return this.stockAdjustmentsService.create(dto, user.sub);
  }

  @Patch(':id')
  @Permissions(Permission.StockAdjustments.Update as PermissionType)
  @UseInterceptors(AuditLogInterceptor)
  @AuditLog({
    module: Module.STOCK_ADJUSTMENTS,
    action: AuditAction.UPDATE,
    entityType: 'stock_adjustment',
  })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateStockAdjustmentDto,
    @CurrentUser() user: JwtPayload,
  ): Promise<ApiResponse<Prisma.StockAdjustmentGetPayload<object>>> {
    return this.stockAdjustmentsService.update(id, dto, user.sub);
  }

  @Patch(':id/status')
  @Permissions(
    Permission.StockAdjustments.Update as PermissionType,
    Permission.StockAdjustments.Approve as PermissionType,
    Permission.StockAdjustments.Reject as PermissionType,
  )
  @UseInterceptors(AuditLogInterceptor)
  @AuditLog({
    module: Module.STOCK_ADJUSTMENTS,
    action: AuditAction.UPDATE,
    entityType: 'stock_adjustment_status',
  })
  async updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateStockAdjustmentStatusDto,
    @CurrentUser() user: JwtPayload,
  ): Promise<ApiResponse<Prisma.StockAdjustmentGetPayload<object>>> {
    return this.stockAdjustmentsService.updateStatus(
      id,
      dto,
      user.sub,
      user.permissions,
    );
  }

  @Delete(':id')
  @Permissions(Permission.StockAdjustments.Delete as PermissionType)
  @UseInterceptors(AuditLogInterceptor)
  @AuditLog({
    module: Module.STOCK_ADJUSTMENTS,
    action: AuditAction.DELETE,
    entityType: 'stock_adjustment',
  })
  @HttpCode(HttpStatus.OK)
  async delete(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.stockAdjustmentsService.delete(id, user.sub);
  }

  @Post('bulk-delete')
  @Permissions(Permission.StockAdjustments.Delete as PermissionType)
  @UseInterceptors(AuditLogInterceptor)
  @AuditLog({
    module: Module.STOCK_ADJUSTMENTS,
    action: AuditAction.DELETE,
    entityType: 'stock_adjustment (bulk)',
  })
  @HttpCode(HttpStatus.OK)
  async bulkDelete(
    @Body() body: { ids: string[] },
    @CurrentUser() user: JwtPayload,
  ) {
    return this.stockAdjustmentsService.bulkDelete(body.ids, user.sub);
  }
}
