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
import { StockTransfersService } from './stock-transfers.service';
import {
  CreateStockTransferDto,
  UpdateStockTransferDto,
  UpdateStockTransferStatusDto,
  QueryStockTransfersDto,
} from './dto';
import { Prisma } from '@bizflow/database';

@Controller('inventory/transfers')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class StockTransfersController {
  constructor(private readonly stockTransfersService: StockTransfersService) {}

  @Get()
  @Permissions(Permission.StockTransfers.Read)
  async findAll(@Query() query: QueryStockTransfersDto): Promise<
    ApiResponse<Prisma.StockTransferGetPayload<object>[]> & {
      summary?: any;
    }
  > {
    return this.stockTransfersService.findAll(query);
  }

  @Get('generate-transfer-number')
  @Permissions(Permission.StockTransfers.Read)
  async generateTransferNumber() {
    const transferNumber =
      await this.stockTransfersService.generateTransferNumber();
    return { data: { transferNumber } };
  }

  @Get(':id')
  @Permissions(Permission.StockTransfers.Read)
  async findById(
    @Param('id') id: string,
  ): Promise<ApiResponse<Prisma.StockTransferGetPayload<object>>> {
    return this.stockTransfersService.findById(id);
  }

  @Post()
  @Permissions(Permission.StockTransfers.Create as PermissionType)
  @UseInterceptors(AuditLogInterceptor)
  @AuditLog({
    module: Module.STOCK_TRANSFERS,
    action: AuditAction.CREATE,
    entityType: 'stock_transfer',
  })
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body() dto: CreateStockTransferDto,
    @CurrentUser() user: JwtPayload,
  ): Promise<ApiResponse<Prisma.StockTransferGetPayload<object>>> {
    return this.stockTransfersService.create(dto, user.sub);
  }

  @Patch(':id')
  @Permissions(Permission.StockTransfers.Update as PermissionType)
  @UseInterceptors(AuditLogInterceptor)
  @AuditLog({
    module: Module.STOCK_TRANSFERS,
    action: AuditAction.UPDATE,
    entityType: 'stock_transfer',
  })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateStockTransferDto,
    @CurrentUser() user: JwtPayload,
  ): Promise<ApiResponse<Prisma.StockTransferGetPayload<object>>> {
    return this.stockTransfersService.update(id, dto, user.sub);
  }

  @Patch(':id/status')
  @Permissions(
    Permission.StockTransfers.Update as PermissionType,
    Permission.StockTransfers.Approve as PermissionType,
  )
  @UseInterceptors(AuditLogInterceptor)
  @AuditLog({
    module: Module.STOCK_TRANSFERS,
    action: AuditAction.UPDATE,
    entityType: 'stock_transfer_status',
  })
  async updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateStockTransferStatusDto,
    @CurrentUser() user: JwtPayload,
  ): Promise<ApiResponse<Prisma.StockTransferGetPayload<object>>> {
    return this.stockTransfersService.updateStatus(id, dto, user.sub);
  }

  @Delete(':id')
  @Permissions(Permission.StockTransfers.Delete as PermissionType)
  @UseInterceptors(AuditLogInterceptor)
  @AuditLog({
    module: Module.STOCK_TRANSFERS,
    action: AuditAction.DELETE,
    entityType: 'stock_transfer',
  })
  @HttpCode(HttpStatus.OK)
  async delete(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.stockTransfersService.delete(id, user.sub);
  }

  @Post('bulk-delete')
  @Permissions(Permission.StockTransfers.Delete as PermissionType)
  @UseInterceptors(AuditLogInterceptor)
  @AuditLog({
    module: Module.STOCK_TRANSFERS,
    action: AuditAction.DELETE,
    entityType: 'stock_transfer (bulk)',
  })
  @HttpCode(HttpStatus.OK)
  async bulkDelete(
    @Body() body: { ids: string[] },
    @CurrentUser() user: JwtPayload,
  ) {
    return this.stockTransfersService.bulkDelete(body.ids, user.sub);
  }
}
