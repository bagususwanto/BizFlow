import {
  Controller,
  Get,
  Query,
  UseGuards,
  Res,
  StreamableFile,
} from '@nestjs/common';
import { Response } from 'express';
import { ExportService } from './export.service';
import { QuerySalesReportDto } from '../sales/dto';
import { QueryStockReportDto } from '../inventory/dto';
import { JwtAuthGuard, PermissionsGuard } from '../../../common/guards';
import { Permissions } from '../../../common/decorators/permissions.decorator';
import { Permission } from '@bizflow/types';

@Controller('reports/export')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class ExportController {
  constructor(private readonly exportService: ExportService) {}

  @Get('sales/excel')
  @Permissions(Permission.Reports.Read)
  async exportSalesExcel(
    @Query() query: QuerySalesReportDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const buffer = await this.exportService.exportSalesExcel(query);
    res.set({
      'Content-Type':
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="sales-report-${new Date().toISOString().split('T')[0]}.xlsx"`,
    });
    return new StreamableFile(buffer as any);
  }

  @Get('sales/pdf')
  @Permissions(Permission.Reports.Read)
  async exportSalesPdf(
    @Query() query: QuerySalesReportDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const buffer = await this.exportService.exportSalesPdf(query);
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="sales-report-${new Date().toISOString().split('T')[0]}.pdf"`,
    });
    return new StreamableFile(buffer as any);
  }

  @Get('inventory/excel')
  @Permissions(Permission.Reports.Read)
  async exportStockExcel(
    @Query() query: QueryStockReportDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const buffer = await this.exportService.exportStockExcel(query);
    res.set({
      'Content-Type':
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="stock-report-${new Date().toISOString().split('T')[0]}.xlsx"`,
    });
    return new StreamableFile(buffer as any);
  }

  @Get('inventory/pdf')
  @Permissions(Permission.Reports.Read)
  async exportStockPdf(
    @Query() query: QueryStockReportDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const buffer = await this.exportService.exportStockPdf(query);
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="stock-report-${new Date().toISOString().split('T')[0]}.pdf"`,
    });
    return new StreamableFile(buffer as any);
  }
}
