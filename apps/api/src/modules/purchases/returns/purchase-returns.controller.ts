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
import { PurchaseReturnsService } from './purchase-returns.service';
import {
  CreatePurchaseReturnDto,
  UpdatePurchaseReturnDto,
  UpdatePurchaseReturnStatusDto,
  QueryPurchaseReturnsDto,
} from './dto';
import { Prisma } from '@bizflow/database';

@Controller('purchases/returns')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class PurchaseReturnsController {
  constructor(
    private readonly purchaseReturnsService: PurchaseReturnsService,
  ) {}

  @Get()
  @Permissions(Permission.PurchaseReturns.Read)
  async findAll(
    @Query() query: QueryPurchaseReturnsDto,
  ): Promise<
    ApiResponse<Prisma.PurchaseReturnGetPayload<object>[]> & { summary?: any }
  > {
    return this.purchaseReturnsService.findAll(query);
  }

  @Get('generate-return-number')
  @Permissions(Permission.PurchaseReturns.Read)
  async generateReturnNumber() {
    const returnNumber =
      await this.purchaseReturnsService.generateReturnNumber();
    return { data: { returnNumber } };
  }

  @Get(':id')
  @Permissions(Permission.PurchaseReturns.Read)
  async findById(
    @Param('id') id: string,
  ): Promise<ApiResponse<Prisma.PurchaseReturnGetPayload<object>>> {
    return this.purchaseReturnsService.findById(id);
  }

  @Post()
  @Permissions(Permission.PurchaseReturns.Create as PermissionType)
  @UseInterceptors(AuditLogInterceptor)
  @AuditLog({
    module: Module.PURCHASE_RETURNS,
    action: AuditAction.CREATE,
    entityType: 'purchase_return',
  })
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body() dto: CreatePurchaseReturnDto,
    @CurrentUser() user: JwtPayload,
  ): Promise<ApiResponse<Prisma.PurchaseReturnGetPayload<object>>> {
    return this.purchaseReturnsService.create(dto, user.sub);
  }

  @Patch(':id')
  @Permissions(Permission.PurchaseReturns.Update as PermissionType)
  @UseInterceptors(AuditLogInterceptor)
  @AuditLog({
    module: Module.PURCHASE_RETURNS,
    action: AuditAction.UPDATE,
    entityType: 'purchase_return',
  })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdatePurchaseReturnDto,
    @CurrentUser() user: JwtPayload,
  ): Promise<ApiResponse<Prisma.PurchaseReturnGetPayload<object>>> {
    return this.purchaseReturnsService.update(id, dto, user.sub);
  }

  @Patch(':id/status')
  @Permissions(
    Permission.PurchaseReturns.Update as PermissionType,
    Permission.PurchaseReturns.Approve as PermissionType,
    Permission.PurchaseReturns.Reject as PermissionType,
  )
  @UseInterceptors(AuditLogInterceptor)
  @AuditLog({
    module: Module.PURCHASE_RETURNS,
    action: AuditAction.UPDATE,
    entityType: 'purchase_return_status',
  })
  async updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdatePurchaseReturnStatusDto,
    @CurrentUser() user: JwtPayload,
  ): Promise<ApiResponse<Prisma.PurchaseReturnGetPayload<object>>> {
    return this.purchaseReturnsService.updateStatus(
      id,
      dto,
      user.sub,
      user.permissions,
    );
  }

  @Delete(':id')
  @Permissions(Permission.PurchaseReturns.Delete as PermissionType)
  @UseInterceptors(AuditLogInterceptor)
  @AuditLog({
    module: Module.PURCHASE_RETURNS,
    action: AuditAction.DELETE,
    entityType: 'purchase_return',
  })
  @HttpCode(HttpStatus.OK)
  async delete(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.purchaseReturnsService.delete(id, user.sub);
  }

  @Post('bulk-delete')
  @Permissions(Permission.PurchaseReturns.Delete as PermissionType)
  @UseInterceptors(AuditLogInterceptor)
  @AuditLog({
    module: Module.PURCHASE_RETURNS,
    action: AuditAction.DELETE,
    entityType: 'purchase_return (bulk)',
  })
  @HttpCode(HttpStatus.OK)
  async bulkDelete(
    @Body() body: { ids: string[] },
    @CurrentUser() user: JwtPayload,
  ) {
    return this.purchaseReturnsService.bulkDelete(body.ids, user.sub);
  }
}
