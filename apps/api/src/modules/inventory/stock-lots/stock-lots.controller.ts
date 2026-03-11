import {
  Controller,
  Get,
  Post,
  Patch,
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
import { Permission, PermissionType, Module, AuditAction } from '@bizflow/types';

import { StockLotsService } from './stock-lots.service';
import {
  CreateStockLotDto,
  UpdateStockLotDto,
  QueryStockLotsDto,
} from './dto';

@Controller('inventory/stock-lots')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class StockLotsController {
  constructor(private readonly stockLotsService: StockLotsService) {}

  /**
   * Get all stock lots with pagination and filters
   */
  @Get()
  @Permissions(Permission.StockLots.Read)
  async findAll(@Query() query: QueryStockLotsDto) {
    return this.stockLotsService.findAll(query);
  }

  /**
   * Get lots expiring within N days (default: 30)
   */
  @Get('expiring-soon')
  @Permissions(Permission.StockLots.Read)
  async findExpiringSoon(@Query('days') days?: string) {
    const daysNum = days ? parseInt(days, 10) : 30;
    return this.stockLotsService.findExpiringSoon(daysNum);
  }

  /**
   * Get a single stock lot by ID
   */
  @Get(':id')
  @Permissions(Permission.StockLots.Read)
  async findById(@Param('id') id: string) {
    return this.stockLotsService.findById(id);
  }

  /**
   * Create a stock lot manually
   */
  @Post()
  @Permissions(Permission.StockLots.Create as PermissionType)
  @UseInterceptors(AuditLogInterceptor)
  @AuditLog({
    module: Module.STOCK_LOTS,
    action: AuditAction.CREATE,
    entityType: 'stock_lot',
  })
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body() dto: CreateStockLotDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.stockLotsService.create(dto, user.sub);
  }

  /**
   * Update a stock lot (expiry date, manufacturing date, notes)
   */
  @Patch(':id')
  @Permissions(Permission.StockLots.Update as PermissionType)
  @UseInterceptors(AuditLogInterceptor)
  @AuditLog({
    module: Module.STOCK_LOTS,
    action: AuditAction.UPDATE,
    entityType: 'stock_lot',
  })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateStockLotDto,
    @CurrentUser() _user: JwtPayload,
  ) {
    return this.stockLotsService.update(id, dto);
  }
}
