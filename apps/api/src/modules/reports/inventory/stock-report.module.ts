import { Module } from '@nestjs/common';
import { StockReportController } from './stock-report.controller';
import { StockReportService } from './stock-report.service';
import { PrismaModule } from '../../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [StockReportController],
  providers: [StockReportService],
  exports: [StockReportService],
})
export class StockReportModule {}
