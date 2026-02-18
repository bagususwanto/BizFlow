import { Controller, Get, UseGuards } from '@nestjs/common';
import { AccountsService } from './accounts.service';
import { JwtAuthGuard } from '../../../common/guards';
import { ApiResponse } from '@bizflow/types';
import { Prisma } from '@bizflow/database';

@Controller('finance/accounts')
@UseGuards(JwtAuthGuard)
export class AccountsController {
  constructor(private readonly accountsService: AccountsService) {}

  @Get()
  async findAll(): Promise<ApiResponse<Prisma.AccountGetPayload<object>[]>> {
    return this.accountsService.findAll();
  }
}
