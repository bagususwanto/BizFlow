import { Module } from '@nestjs/common';

import { TransactionsService } from './transactions.service';
import { TransactionsController } from './transactions.controller';
import { PromotionsModule } from '../../master-data/promotions';

@Module({
  imports: [PromotionsModule],
  controllers: [TransactionsController],
  providers: [TransactionsService],
  exports: [TransactionsService],
})
export class TransactionsModule {}
