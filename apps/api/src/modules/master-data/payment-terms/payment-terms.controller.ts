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
import { PaymentTermsService } from './payment-terms.service';
import {
  CreatePaymentTermDto,
  UpdatePaymentTermDto,
  QueryPaymentTermsDto,
} from './dto';
import { Prisma } from '@bizflow/database';

@Controller('master-data/payment-terms')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class PaymentTermsController {
  constructor(private readonly paymentTermsService: PaymentTermsService) {}

  @Get()
  @Permissions(Permission.PaymentTerms.Read)
  async findAll(
    @Query() query: QueryPaymentTermsDto,
  ): Promise<
    ApiResponse<Prisma.PaymentTermGetPayload<object>[]> & { summary?: any }
  > {
    return this.paymentTermsService.findAll(query);
  }

  @Get('list/active')
  @Permissions(Permission.PaymentTerms.Read)
  async findActiveList() {
    return this.paymentTermsService.findActiveList();
  }

  @Get(':id')
  @Permissions(Permission.PaymentTerms.Read)
  async findById(
    @Param('id') id: string,
  ): Promise<ApiResponse<Prisma.PaymentTermGetPayload<object>>> {
    return this.paymentTermsService.findById(id);
  }

  @Post()
  @Permissions(Permission.PaymentTerms.Create as PermissionType)
  @UseInterceptors(AuditLogInterceptor)
  @AuditLog({
    module: Module.PAYMENT_TERMS,
    action: AuditAction.CREATE,
    entityType: 'payment-term',
  })
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body() dto: CreatePaymentTermDto,
    @CurrentUser() user: JwtPayload,
  ): Promise<ApiResponse<Prisma.PaymentTermGetPayload<object>>> {
    return this.paymentTermsService.create(dto);
  }

  @Patch(':id')
  @Permissions(Permission.PaymentTerms.Update as PermissionType)
  @UseInterceptors(AuditLogInterceptor)
  @AuditLog({
    module: Module.PAYMENT_TERMS,
    action: AuditAction.UPDATE,
    entityType: 'payment-term',
  })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdatePaymentTermDto,
    @CurrentUser() user: JwtPayload,
  ): Promise<ApiResponse<Prisma.PaymentTermGetPayload<object>>> {
    return this.paymentTermsService.update(id, dto);
  }

  @Delete(':id')
  @Permissions(Permission.PaymentTerms.Delete as PermissionType)
  @UseInterceptors(AuditLogInterceptor)
  @AuditLog({
    module: Module.PAYMENT_TERMS,
    action: AuditAction.DELETE,
    entityType: 'payment-term',
  })
  @HttpCode(HttpStatus.OK)
  async delete(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.paymentTermsService.delete(id);
  }

  @Post('bulk-delete')
  @Permissions(Permission.PaymentTerms.Delete as PermissionType)
  @UseInterceptors(AuditLogInterceptor)
  @AuditLog({
    module: Module.PAYMENT_TERMS,
    action: AuditAction.DELETE,
    entityType: 'payment-term (bulk)',
  })
  @HttpCode(HttpStatus.OK)
  async bulkDelete(
    @Body() body: { ids: string[] },
    @CurrentUser() user: JwtPayload,
  ) {
    return this.paymentTermsService.bulkDelete(body.ids);
  }
}
