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
import { QuotationsService } from './quotations.service';
import {
  CreateQuotationDto,
  UpdateQuotationDto,
  UpdateQuotationStatusDto,
  QueryQuotationsDto,
  ConvertQuotationDto,
} from './dto';
import { Prisma } from '@bizflow/database';

@Controller('sales/quotations')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class QuotationsController {
  constructor(private readonly quotationsService: QuotationsService) {}

  @Get()
  @Permissions(Permission.Quotations.Read)
  async findAll(
    @Query() query: QueryQuotationsDto,
  ): Promise<
    ApiResponse<Prisma.QuotationGetPayload<object>[]> & { summary?: any }
  > {
    return this.quotationsService.findAll(query);
  }

  @Get('generate-quotation-number')
  @Permissions(Permission.Quotations.Read)
  async generateQuotationNumber() {
    const quotationNumber =
      await this.quotationsService.generateQuotationNumber();
    return { data: { quotationNumber } };
  }

  @Get(':id')
  @Permissions(Permission.Quotations.Read)
  async findById(
    @Param('id') id: string,
  ): Promise<ApiResponse<Prisma.QuotationGetPayload<object>>> {
    return this.quotationsService.findById(id);
  }

  @Post()
  @Permissions(Permission.Quotations.Create as PermissionType)
  @UseInterceptors(AuditLogInterceptor)
  @AuditLog({
    module: Module.QUOTATIONS,
    action: AuditAction.CREATE,
    entityType: 'quotation',
  })
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body() dto: CreateQuotationDto,
    @CurrentUser() user: JwtPayload,
  ): Promise<ApiResponse<Prisma.QuotationGetPayload<object>>> {
    return this.quotationsService.create(dto, user.sub);
  }

  @Patch(':id')
  @Permissions(Permission.Quotations.Update as PermissionType)
  @UseInterceptors(AuditLogInterceptor)
  @AuditLog({
    module: Module.QUOTATIONS,
    action: AuditAction.UPDATE,
    entityType: 'quotation',
  })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateQuotationDto,
    @CurrentUser() user: JwtPayload,
  ): Promise<ApiResponse<Prisma.QuotationGetPayload<object>>> {
    return this.quotationsService.update(id, dto, user.sub);
  }

  @Patch(':id/status')
  @Permissions(
    Permission.Quotations.Update as PermissionType,
    Permission.Quotations.Send as PermissionType,
  )
  @UseInterceptors(AuditLogInterceptor)
  @AuditLog({
    module: Module.QUOTATIONS,
    action: AuditAction.UPDATE,
    entityType: 'quotation_status',
  })
  async updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateQuotationStatusDto,
    @CurrentUser() user: JwtPayload,
  ): Promise<ApiResponse<Prisma.QuotationGetPayload<object>>> {
    return this.quotationsService.updateStatus(id, dto, user.sub);
  }

  @Post(':id/convert')
  @Permissions(Permission.Quotations.Convert as PermissionType)
  @UseInterceptors(AuditLogInterceptor)
  @AuditLog({
    module: Module.QUOTATIONS,
    action: AuditAction.CREATE,
    entityType: 'quotation_convert',
  })
  @HttpCode(HttpStatus.CREATED)
  async convertToSalesOrder(
    @Param('id') id: string,
    @Body() dto: ConvertQuotationDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.quotationsService.convertToSalesOrder(id, dto, user.sub);
  }

  @Delete(':id')
  @Permissions(Permission.Quotations.Delete as PermissionType)
  @UseInterceptors(AuditLogInterceptor)
  @AuditLog({
    module: Module.QUOTATIONS,
    action: AuditAction.DELETE,
    entityType: 'quotation',
  })
  @HttpCode(HttpStatus.OK)
  async delete(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.quotationsService.delete(id, user.sub);
  }

  @Post('bulk-delete')
  @Permissions(Permission.Quotations.Delete as PermissionType)
  @UseInterceptors(AuditLogInterceptor)
  @AuditLog({
    module: Module.QUOTATIONS,
    action: AuditAction.DELETE,
    entityType: 'quotation (bulk)',
  })
  @HttpCode(HttpStatus.OK)
  async bulkDelete(
    @Body() body: { ids: string[] },
    @CurrentUser() user: JwtPayload,
  ) {
    return this.quotationsService.bulkDelete(body.ids, user.sub);
  }
}
