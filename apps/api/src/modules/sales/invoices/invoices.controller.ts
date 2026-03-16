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
import { InvoicesService } from './invoices.service';
import {
  CreateInvoiceDto,
  UpdateInvoiceDto,
  QueryInvoicesDto,
  UpdateInvoiceStatusDto,
} from './dto';
import { Prisma } from '@bizflow/database';

@Controller('sales/invoices')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class InvoicesController {
  constructor(private readonly invoicesService: InvoicesService) {}

  @Get()
  @Permissions(Permission.Invoices.Read)
  async findAll(
    @Query() query: QueryInvoicesDto,
  ): Promise<
    ApiResponse<Prisma.InvoiceGetPayload<object>[]> & { summary?: any }
  > {
    return this.invoicesService.findAll(query);
  }

  @Get('generate-invoice-number')
  @Permissions(Permission.Invoices.Read)
  async generateInvoiceNumber() {
    const invoiceNumber = await this.invoicesService.generateInvoiceNumber();
    return { data: { invoiceNumber } };
  }

  @Get(':id')
  @Permissions(Permission.Invoices.Read)
  async findById(
    @Param('id') id: string,
  ): Promise<ApiResponse<Prisma.InvoiceGetPayload<object>>> {
    return this.invoicesService.findById(id);
  }

  @Post()
  @Permissions(Permission.Invoices.Create as PermissionType)
  @UseInterceptors(AuditLogInterceptor)
  @AuditLog({
    module: Module.INVOICES,
    action: AuditAction.CREATE,
    entityType: 'invoice',
  })
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body() dto: CreateInvoiceDto,
    @CurrentUser() user: JwtPayload,
  ): Promise<ApiResponse<Prisma.InvoiceGetPayload<object>>> {
    return this.invoicesService.create(dto, user.sub);
  }

  @Patch(':id')
  @Permissions(Permission.Invoices.Update as PermissionType)
  @UseInterceptors(AuditLogInterceptor)
  @AuditLog({
    module: Module.INVOICES,
    action: AuditAction.UPDATE,
    entityType: 'invoice',
  })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateInvoiceDto,
    @CurrentUser() user: JwtPayload,
  ): Promise<ApiResponse<Prisma.InvoiceGetPayload<object>>> {
    return this.invoicesService.update(id, dto, user.sub);
  }

  @Patch(':id/status')
  @Permissions(Permission.Invoices.Update as PermissionType)
  @UseInterceptors(AuditLogInterceptor)
  @AuditLog({
    module: Module.INVOICES,
    action: AuditAction.UPDATE,
    entityType: 'invoice_status',
  })
  async updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateInvoiceStatusDto,
    @CurrentUser() user: JwtPayload,
  ): Promise<ApiResponse<Prisma.InvoiceGetPayload<object>>> {
    return this.invoicesService.updateStatus(id, dto, user.sub);
  }

  @Delete(':id')
  @Permissions(Permission.Invoices.Delete as PermissionType)
  @UseInterceptors(AuditLogInterceptor)
  @AuditLog({
    module: Module.INVOICES,
    action: AuditAction.DELETE,
    entityType: 'invoice',
  })
  @HttpCode(HttpStatus.OK)
  async delete(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.invoicesService.delete(id, user.sub);
  }

  @Post('bulk-delete')
  @Permissions(Permission.Invoices.Delete as PermissionType)
  @UseInterceptors(AuditLogInterceptor)
  @AuditLog({
    module: Module.INVOICES,
    action: AuditAction.DELETE,
    entityType: 'invoice (bulk)',
  })
  @HttpCode(HttpStatus.OK)
  async bulkDelete(
    @Body() body: { ids: string[] },
    @CurrentUser() user: JwtPayload,
  ) {
    return this.invoicesService.bulkDelete(body.ids, user.sub);
  }
}
