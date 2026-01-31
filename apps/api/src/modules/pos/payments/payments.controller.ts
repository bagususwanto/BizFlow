import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
  UseInterceptors,
} from '@nestjs/common';

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

import { PaymentsService } from './payments.service';
import {
  CreatePaymentDto,
  QueryPaymentsDto,
  ProcessRefundDto,
  SplitPaymentDto,
} from './dto';

@Controller('pos/payments')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  /**
   * Create payment for existing order
   * POST /pos/payments
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @Permissions(Permission.Pos.Create as PermissionType)
  @UseInterceptors(AuditLogInterceptor)
  @AuditLog({
    module: Module.POS,
    action: AuditAction.CREATE,
    entityType: 'pos payment',
  })
  async create(@Body() dto: CreatePaymentDto, @CurrentUser() user: JwtPayload) {
    return this.paymentsService.createPayment(dto, user.sub);
  }

  /**
   * Get all payments with filters
   * GET /pos/payments
   */
  @Get()
  @Permissions(Permission.Pos.Read as PermissionType)
  async findAll(@Query() query: QueryPaymentsDto) {
    return this.paymentsService.findAll(query);
  }

  /**
   * Get payment summary/report
   * GET /pos/payments/summary
   */
  @Get('summary')
  @Permissions(Permission.Pos.Read as PermissionType)
  async getSummary(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('accountId') accountId?: string,
    @Query('paymentMethod') paymentMethod?: string,
  ) {
    return this.paymentsService.getPaymentSummary({
      startDate,
      endDate,
      accountId,
      paymentMethod,
    });
  }

  /**
   * Validate split payment
   * POST /pos/payments/validate-split
   */
  @Post('validate-split')
  @HttpCode(HttpStatus.OK)
  @Permissions(Permission.Pos.Read as PermissionType)
  async validateSplit(@Body() dto: SplitPaymentDto) {
    return this.paymentsService.validateSplitPayment(dto);
  }

  /**
   * Get payment by ID
   * GET /pos/payments/:id
   */
  @Get(':id')
  @Permissions(Permission.Pos.Read as PermissionType)
  async findById(@Param('id') id: string) {
    return this.paymentsService.findById(id);
  }

  /**
   * Process refund for payment
   * POST /pos/payments/:id/refund
   */
  @Post(':id/refund')
  @HttpCode(HttpStatus.OK)
  @Permissions(Permission.Pos.Create as PermissionType)
  @UseInterceptors(AuditLogInterceptor)
  @AuditLog({
    module: Module.POS,
    action: AuditAction.CREATE,
    entityType: 'payment refund',
  })
  async processRefund(
    @Param('id') id: string,
    @Body() dto: ProcessRefundDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.paymentsService.processRefund(id, dto, user.sub);
  }
}
