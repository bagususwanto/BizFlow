import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
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
  PermissionType,
  Module,
  AuditAction,
  ApiResponse,
} from '@bizflow/types';
import { CustomerPaymentsService } from './customer-payments.service';
import {
  CreateCustomerPaymentDto,
  UpdateCustomerPaymentDto,
  QueryCustomerPaymentsDto,
} from './dto';
import { Prisma } from '@bizflow/database';

@Controller('sales/payments')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class CustomerPaymentsController {
  constructor(
    private readonly customerPaymentsService: CustomerPaymentsService,
  ) {}

  @Get()
  @Permissions(Permission.CustomerPayments.Read)
  async findAll(
    @Query() query: QueryCustomerPaymentsDto,
  ): Promise<ApiResponse<Prisma.PaymentGetPayload<object>[]> & { summary?: any }> {
    return this.customerPaymentsService.findAll(query);
  }

  @Get('generate-payment-number')
  @Permissions(Permission.CustomerPayments.Read)
  async generatePaymentNumber() {
    const paymentNumber =
      await this.customerPaymentsService.generatePaymentNumber();
    return { data: { paymentNumber } };
  }

  @Get(':id')
  @Permissions(Permission.CustomerPayments.Read)
  async findById(
    @Param('id') id: string,
  ): Promise<ApiResponse<Prisma.PaymentGetPayload<object>>> {
    return this.customerPaymentsService.findById(id);
  }

  @Post()
  @Permissions(Permission.CustomerPayments.Create as PermissionType)
  @UseInterceptors(AuditLogInterceptor)
  @AuditLog({
    module: Module.CUSTOMER_PAYMENTS,
    action: AuditAction.CREATE,
    entityType: 'customer_payment',
  })
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body() dto: CreateCustomerPaymentDto,
    @CurrentUser() user: JwtPayload,
  ): Promise<ApiResponse<Prisma.PaymentGetPayload<object>>> {
    return this.customerPaymentsService.create(dto, user.sub);
  }

  @Patch(':id')
  @Permissions(Permission.CustomerPayments.Update as PermissionType)
  @UseInterceptors(AuditLogInterceptor)
  @AuditLog({
    module: Module.CUSTOMER_PAYMENTS,
    action: AuditAction.UPDATE,
    entityType: 'customer_payment',
  })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateCustomerPaymentDto,
    @CurrentUser() user: JwtPayload,
  ): Promise<ApiResponse<Prisma.PaymentGetPayload<object>>> {
    return this.customerPaymentsService.update(id, dto, user.sub);
  }

  @Delete(':id')
  @Permissions(Permission.CustomerPayments.Delete as PermissionType)
  @UseInterceptors(AuditLogInterceptor)
  @AuditLog({
    module: Module.CUSTOMER_PAYMENTS,
    action: AuditAction.DELETE,
    entityType: 'customer_payment',
  })
  @HttpCode(HttpStatus.OK)
  async delete(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.customerPaymentsService.delete(id, user.sub);
  }

  @Post('bulk-delete')
  @Permissions(Permission.CustomerPayments.Delete as PermissionType)
  @UseInterceptors(AuditLogInterceptor)
  @AuditLog({
    module: Module.CUSTOMER_PAYMENTS,
    action: AuditAction.DELETE,
    entityType: 'customer_payment (bulk)',
  })
  @HttpCode(HttpStatus.OK)
  async bulkDelete(
    @Body() body: { ids: string[] },
    @CurrentUser() user: JwtPayload,
  ) {
    return this.customerPaymentsService.bulkDelete(body.ids, user.sub);
  }
}
