import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { SalesReportService } from './sales-report.service';
import { QuerySalesReportDto } from './dto';
import { JwtAuthGuard, PermissionsGuard } from '../../../common/guards';
import { Permissions } from '../../../common/decorators/permissions.decorator';
import { Permission } from '@bizflow/types';
import { successResponse } from '../../../common/utils';

@Controller('reports/sales')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class SalesReportController {
  constructor(private readonly salesReportService: SalesReportService) {}

  @Get()
  @Permissions(Permission.Reports.Read)
  async getReport(@Query() query: QuerySalesReportDto) {
    const data = await this.salesReportService.getReport(query);
    return successResponse(
      {
        summary: data.summary,
        dailyBreakdown: data.dailyBreakdown,
        details: data.details,
      },
      {
        page: data.meta.page,
        pageSize: data.meta.pageSize,
        totalItems: data.meta.totalItems,
        totalPages: data.meta.totalPages,
      },
    );
  }
}
