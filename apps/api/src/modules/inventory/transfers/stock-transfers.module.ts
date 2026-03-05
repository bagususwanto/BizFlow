import { Module } from '@nestjs/common';
import { PrismaModule } from '../../../prisma';
import { StockTransfersController } from './stock-transfers.controller';
import { StockTransfersService } from './stock-transfers.service';

@Module({
  imports: [PrismaModule],
  controllers: [StockTransfersController],
  providers: [StockTransfersService],
  exports: [StockTransfersService],
})
export class StockTransfersModule {}
