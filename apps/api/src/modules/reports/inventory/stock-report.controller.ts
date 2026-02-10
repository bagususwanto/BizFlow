import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { StockReportService } from './stock-report.service';
import { QueryStockReportDto } from './dto';
import { JwtAuthGuard, PermissionsGuard } from '../../../common/guards';
import { Permissions } from '../../../common/decorators/permissions.decorator';
import { Permission } from '@bizflow/types';
import { paginatedResponse } from '../../../common/utils';

@Controller('reports/inventory')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class StockReportController {
  constructor(private readonly stockReportService: StockReportService) {}

  @Get()
  @Permissions(Permission.Reports.Read)
  async getReport(@Query() query: QueryStockReportDto) {
    const result = await this.stockReportService.getReport(query);
    return paginatedResponse(result.data, result.meta, result.summary);
  }
}
