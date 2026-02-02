import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
  UseInterceptors,
} from '@nestjs/common';
import { SalesOrder } from '@bizflow/database';

import { JwtAuthGuard, PermissionsGuard } from '../../../common/guards';
import { CurrentUser } from '../../../common/decorators';
import { Permissions } from '../../../common/decorators/permissions.decorator';
import { AuditLog } from '../../../common/decorators/audit-log.decorator';
import { AuditLogInterceptor } from '../../../common/interceptors/audit-log.interceptor';
import type { JwtPayload } from '../../core/auth/strategies/jwt.strategy';
import {
  Permission,
  type PermissionType,
  Module,
  AuditAction,
} from '@bizflow/types';

import { TransactionsService } from './transactions.service';
import {
  CreatePOSTransactionDto,
  QueryPOSTransactionsDto,
  SearchProductsDto,
  HoldTransactionDto,
} from './dto';

@Controller('pos/transactions')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  /**
   * Search products for POS
   * POST /pos/transactions/search-products
   */
  @Post('search-products')
  @HttpCode(HttpStatus.OK)
  @Permissions(Permission.Pos.Read as PermissionType)
  async searchProducts(@Body() dto: SearchProductsDto) {
    return this.transactionsService.searchProducts(dto);
  }

  /**
   * Get all transactions with filters
   * GET /pos/transactions
   */
  @Get()
  @Permissions(Permission.Pos.Read as PermissionType)
  async findAll(@Query() query: QueryPOSTransactionsDto) {
    return this.transactionsService.findAll(query);
  }

  /**
   * Get transaction by ID
   * GET /pos/transactions/:id
   */
  @Get(':id')
  @Permissions(Permission.Pos.Read as PermissionType)
  async findById(@Param('id') id: string) {
    return this.transactionsService.findById(id);
  }

  /**
   * Create new transaction (quick sale)
   * POST /pos/transactions
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @Permissions(Permission.Pos.Create as PermissionType)
  @UseInterceptors(AuditLogInterceptor)
  @AuditLog({
    module: Module.POS,
    action: AuditAction.CREATE,
    entityType: 'pos transaction',
  })
  async create(
    @Body() dto: CreatePOSTransactionDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.transactionsService.createTransaction(dto, user.sub);
  }

  /**
   * Hold transaction
   * POST /pos/transactions/hold
   */

  @Post('hold')
  @HttpCode(HttpStatus.OK)
  @Permissions(Permission.Pos.Create as PermissionType)
  @UseInterceptors(AuditLogInterceptor)
  @AuditLog({
    module: Module.POS,
    action: AuditAction.CREATE,
    entityType: 'held transaction',
  })
  async holdTransaction(
    @Body() dto: HoldTransactionDto,
    @CurrentUser() user: JwtPayload,
  ): Promise<SalesOrder> {
    return this.transactionsService.holdTransaction(dto, user.sub);
  }

  /**
   * Get held transactions
   * GET /pos/transactions/held
   */
  @Get('held/list')
  @Permissions(Permission.Pos.Read as PermissionType)
  async getHeldTransactions(@CurrentUser() user: JwtPayload) {
    return this.transactionsService.getHeldTransactions(user.sub);
  }

  /**
   * Resume held transaction
   * POST /pos/transactions/held/:id/resume
   */
  @Post('held/:id/resume')
  @HttpCode(HttpStatus.OK)
  @Permissions(Permission.Pos.Create as PermissionType)
  async resumeHeldTransaction(
    @Param('id') id: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.transactionsService.resumeHeldTransaction(id, user.sub);
  }

  /**
   * Delete held transaction
   * DELETE /pos/transactions/held/:id
   */
  @Delete('held/:id')
  @HttpCode(HttpStatus.OK)
  @Permissions(Permission.Pos.Delete as PermissionType)
  @UseInterceptors(AuditLogInterceptor)
  @AuditLog({
    module: Module.POS,
    action: AuditAction.DELETE,
    entityType: 'held transaction',
  })
  async deleteHeldTransaction(
    @Param('id') id: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.transactionsService.deleteHeldTransaction(id, user.sub);
  }
}
