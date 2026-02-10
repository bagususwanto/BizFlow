import { Module } from '@nestjs/common';
import { ExportController } from './export.controller';
import { ExportService } from './export.service';
import { SalesReportModule } from '../sales';
import { StockReportModule } from '../inventory';
import { PrismaModule } from '../../../prisma/prisma.module';

@Module({
  imports: [PrismaModule, SalesReportModule, StockReportModule],
  controllers: [ExportController],
  providers: [ExportService],
  exports: [ExportService],
})
export class ExportModule {}
