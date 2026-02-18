import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma';
import { ApiResponse } from '@bizflow/types';
import { Prisma } from '@bizflow/database';

@Injectable()
export class AccountsService {
  constructor(private prisma: PrismaService) {}

  async findAll(): Promise<ApiResponse<Prisma.AccountGetPayload<object>[]>> {
    const data = await this.prisma.account.findMany({
      where: {
        isActive: true,
      },
      orderBy: {
        name: 'asc',
      },
    });

    return {
      success: true,
      data,
    };
  }
}
