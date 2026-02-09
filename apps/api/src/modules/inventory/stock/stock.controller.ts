import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard, PermissionsGuard } from '../../../common/guards';
import { Permissions } from '../../../common/decorators/permissions.decorator';
import { Permission } from '@bizflow/types';

import { StockService } from './stock.service';
import { QueryStockDto, QueryStockMovementDto, QueryStockCardDto } from './dto';

@Controller('inventory/stock')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class StockController {
  constructor(private readonly stockService: StockService) {}

  /**
   * Get all stock with pagination and filters
   */
  @Get()
  @Permissions(Permission.Inventory.Read)
  async findAll(@Query() query: QueryStockDto) {
    return this.stockService.findAll(query);
  }

  /**
   * Get stock by variant ID (across all warehouses)
   */
  @Get('variant/:variantId')
  @Permissions(Permission.Inventory.Read)
  async findByVariant(@Param('variantId') variantId: string) {
    return this.stockService.findByVariant(variantId);
  }

  /**
   * Get stock by warehouse ID
   */
  @Get('warehouse/:warehouseId')
  @Permissions(Permission.Inventory.Read)
  async findByWarehouse(@Param('warehouseId') warehouseId: string) {
    return this.stockService.findByWarehouse(warehouseId);
  }

  /**
   * Get all stock movements with pagination and filters
   */
  @Get('movements')
  @Permissions(Permission.Inventory.Read)
  async findAllMovements(@Query() query: QueryStockMovementDto) {
    return this.stockService.findAllMovements(query);
  }

  /**
   * Get stock card for a specific variant (movement history with running balance)
   */
  @Get('movements/card/:variantId')
  @Permissions(Permission.Inventory.Read)
  async findStockCard(
    @Param('variantId') variantId: string,
    @Query() query: QueryStockCardDto,
  ) {
    return this.stockService.findStockCard(variantId, query);
  }
}
