import { Module } from '@nestjs/common';
import { PrismaModule } from '../../../prisma';
import { GoodsReceiveController } from './goods-receive.controller';
import { GoodsReceiveService } from './goods-receive.service';
import { StockLotsModule } from '../stock-lots';
import { StockValuationModule } from '../stock-valuation';

@Module({
  imports: [PrismaModule, StockLotsModule, StockValuationModule],
  controllers: [GoodsReceiveController],
  providers: [GoodsReceiveService],
  exports: [GoodsReceiveService],
})
export class GoodsReceiveModule {}
