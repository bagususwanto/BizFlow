import { Module } from '@nestjs/common';
import { PrismaModule } from '../../../prisma';
import { PurchaseReturnsController } from './purchase-returns.controller';
import { PurchaseReturnsService } from './purchase-returns.service';

@Module({
  imports: [PrismaModule],
  controllers: [PurchaseReturnsController],
  providers: [PurchaseReturnsService],
  exports: [PurchaseReturnsService],
})
export class PurchaseReturnsModule {}
