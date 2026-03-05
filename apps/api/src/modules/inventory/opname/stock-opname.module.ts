import { Module } from '@nestjs/common';
import { PrismaModule } from '../../../prisma';
import { StockOpnameController } from './stock-opname.controller';
import { StockOpnameService } from './stock-opname.service';

@Module({
  imports: [PrismaModule],
  controllers: [StockOpnameController],
  providers: [StockOpnameService],
  exports: [StockOpnameService],
})
export class StockOpnameModule {}
