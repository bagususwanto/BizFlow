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
import { SupplierPaymentsService } from './supplier-payments.service';
import {
  CreateSupplierPaymentDto,
  UpdateSupplierPaymentDto,
  QuerySupplierPaymentsDto,
} from './dto';
import { Prisma } from '@bizflow/database';

@Controller('purchases/payments')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class SupplierPaymentsController {
  constructor(
    private readonly supplierPaymentsService: SupplierPaymentsService,
  ) {}

  @Get()
  @Permissions(Permission.SupplierPayments.Read)
  async findAll(@Query() query: QuerySupplierPaymentsDto): Promise<
    ApiResponse<Prisma.SupplierPaymentGetPayload<object>[]> & {
      summary?: any;
    }
  > {
    return this.supplierPaymentsService.findAll(query);
  }

  @Get('generate-payment-number')
  @Permissions(Permission.SupplierPayments.Read)
  async generatePaymentNumber() {
    const paymentNumber =
      await this.supplierPaymentsService.generatePaymentNumber();
    return { data: { paymentNumber } };
  }

  @Get(':id')
  @Permissions(Permission.SupplierPayments.Read)
  async findById(
    @Param('id') id: string,
  ): Promise<ApiResponse<Prisma.SupplierPaymentGetPayload<object>>> {
    return this.supplierPaymentsService.findById(id);
  }

  @Post()
  @Permissions(Permission.SupplierPayments.Create as PermissionType)
  @UseInterceptors(AuditLogInterceptor)
  @AuditLog({
    module: Module.SUPPLIER_PAYMENTS,
    action: AuditAction.CREATE,
    entityType: 'supplier_payment',
  })
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body() dto: CreateSupplierPaymentDto,
    @CurrentUser() user: JwtPayload,
  ): Promise<ApiResponse<Prisma.SupplierPaymentGetPayload<object>>> {
    return this.supplierPaymentsService.create(dto, user.sub);
  }

  @Patch(':id')
  @Permissions(Permission.SupplierPayments.Update as PermissionType)
  @UseInterceptors(AuditLogInterceptor)
  @AuditLog({
    module: Module.SUPPLIER_PAYMENTS,
    action: AuditAction.UPDATE,
    entityType: 'supplier_payment',
  })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateSupplierPaymentDto,
    @CurrentUser() user: JwtPayload,
  ): Promise<ApiResponse<Prisma.SupplierPaymentGetPayload<object>>> {
    return this.supplierPaymentsService.update(id, dto, user.sub);
  }

  @Delete(':id')
  @Permissions(Permission.SupplierPayments.Delete as PermissionType)
  @UseInterceptors(AuditLogInterceptor)
  @AuditLog({
    module: Module.SUPPLIER_PAYMENTS,
    action: AuditAction.DELETE,
    entityType: 'supplier_payment',
  })
  @HttpCode(HttpStatus.OK)
  async delete(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.supplierPaymentsService.delete(id, user.sub);
  }

  @Post('bulk-delete')
  @Permissions(Permission.SupplierPayments.Delete as PermissionType)
  @UseInterceptors(AuditLogInterceptor)
  @AuditLog({
    module: Module.SUPPLIER_PAYMENTS,
    action: AuditAction.DELETE,
    entityType: 'supplier_payment (bulk)',
  })
  @HttpCode(HttpStatus.OK)
  async bulkDelete(
    @Body() body: { ids: string[] },
    @CurrentUser() user: JwtPayload,
  ) {
    return this.supplierPaymentsService.bulkDelete(body.ids, user.sub);
  }
}
