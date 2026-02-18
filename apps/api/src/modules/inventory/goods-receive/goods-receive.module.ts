import { Module } from '@nestjs/common';
import { PrismaModule } from '../../../prisma';
import { GoodsReceiveController } from './goods-receive.controller';
import { GoodsReceiveService } from './goods-receive.service';

@Module({
  imports: [PrismaModule],
  controllers: [GoodsReceiveController],
  providers: [GoodsReceiveService],
  exports: [GoodsReceiveService],
})
export class GoodsReceiveModule {}
