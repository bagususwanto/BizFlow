import {
  Controller,
  Get,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard, PermissionsGuard } from '../../../common/guards';
import { Permissions } from '../../../common/decorators/permissions.decorator';
import { Permission } from '@bizflow/types';

import { StockValuationService } from './stock-valuation.service';
import { QueryStockValuationDto } from './dto';

@Controller('inventory/stock-valuation')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class StockValuationController {
  constructor(
    private readonly stockValuationService: StockValuationService,
  ) {}

  /**
   * Get all stock valuations (HPP per variant per warehouse) with pagination
   */
  @Get()
  @Permissions(Permission.StockValuation.Read)
  async findAll(@Query() query: QueryStockValuationDto) {
    return this.stockValuationService.findAll(query);
  }

  /**
   * Get total inventory value summary
   */
  @Get('summary')
  @Permissions(Permission.StockValuation.Read)
  async getSummary() {
    return this.stockValuationService.getSummary();
  }

  /**
   * Get HPP breakdown for a specific variant (by warehouse)
   */
  @Get('variant/:variantId')
  @Permissions(Permission.StockValuation.Read)
  async findByVariant(@Param('variantId') variantId: string) {
    return this.stockValuationService.findByVariant(variantId);
  }
}
