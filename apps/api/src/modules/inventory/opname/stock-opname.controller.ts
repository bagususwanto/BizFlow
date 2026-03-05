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
import { StockOpnameService } from './stock-opname.service';
import {
  CreateStockOpnameDto,
  UpdateStockOpnameItemsDto,
  FinalizeStockOpnameDto,
  CancelStockOpnameDto,
  QueryStockOpnamesDto,
} from './dto';
import { Prisma } from '@bizflow/database';

@Controller('inventory/opname')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class StockOpnameController {
  constructor(private readonly stockOpnameService: StockOpnameService) {}

  @Get()
  @Permissions(Permission.StockOpnames.Read)
  async findAll(@Query() query: QueryStockOpnamesDto): Promise<
    ApiResponse<Prisma.StockOpnameGetPayload<object>[]> & {
      summary?: any;
    }
  > {
    return this.stockOpnameService.findAll(query);
  }

  @Get('generate-opname-number')
  @Permissions(Permission.StockOpnames.Read)
  async generateOpnameNumber() {
    const opnameNumber = await this.stockOpnameService.generateOpnameNumber();
    return { data: { opnameNumber } };
  }

  @Get(':id')
  @Permissions(Permission.StockOpnames.Read)
  async findById(
    @Param('id') id: string,
  ): Promise<ApiResponse<Prisma.StockOpnameGetPayload<object>>> {
    return this.stockOpnameService.findById(id);
  }

  @Post()
  @Permissions(Permission.StockOpnames.Create as PermissionType)
  @UseInterceptors(AuditLogInterceptor)
  @AuditLog({
    module: Module.STOCK_OPNAMES,
    action: AuditAction.CREATE,
    entityType: 'stock_opname',
  })
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body() dto: CreateStockOpnameDto,
    @CurrentUser() user: JwtPayload,
  ): Promise<ApiResponse<Prisma.StockOpnameGetPayload<object>>> {
    return this.stockOpnameService.create(dto, user.sub);
  }

  @Patch(':id/items')
  @Permissions(Permission.StockOpnames.Update as PermissionType)
  @UseInterceptors(AuditLogInterceptor)
  @AuditLog({
    module: Module.STOCK_OPNAMES,
    action: AuditAction.UPDATE,
    entityType: 'stock_opname_items',
  })
  async updateItems(
    @Param('id') id: string,
    @Body() dto: UpdateStockOpnameItemsDto,
    @CurrentUser() user: JwtPayload,
  ): Promise<ApiResponse<Prisma.StockOpnameGetPayload<object>>> {
    return this.stockOpnameService.updateItems(id, dto, user.sub);
  }

  @Patch(':id/finalize')
  @Permissions(
    Permission.StockOpnames.Finalize as PermissionType,
    Permission.StockOpnames.Update as PermissionType,
  )
  @UseInterceptors(AuditLogInterceptor)
  @AuditLog({
    module: Module.STOCK_OPNAMES,
    action: AuditAction.UPDATE,
    entityType: 'stock_opname_finalize',
  })
  async finalize(
    @Param('id') id: string,
    @Body() dto: FinalizeStockOpnameDto,
    @CurrentUser() user: JwtPayload,
  ): Promise<ApiResponse<Prisma.StockOpnameGetPayload<object>>> {
    return this.stockOpnameService.finalize(id, dto, user.sub);
  }

  @Patch(':id/cancel')
  @Permissions(
    Permission.StockOpnames.Cancel as PermissionType,
    Permission.StockOpnames.Update as PermissionType,
  )
  @UseInterceptors(AuditLogInterceptor)
  @AuditLog({
    module: Module.STOCK_OPNAMES,
    action: AuditAction.UPDATE,
    entityType: 'stock_opname_cancel',
  })
  async cancel(
    @Param('id') id: string,
    @Body() dto: CancelStockOpnameDto,
    @CurrentUser() user: JwtPayload,
  ): Promise<ApiResponse<Prisma.StockOpnameGetPayload<object>>> {
    return this.stockOpnameService.cancel(id, dto, user.sub);
  }

  @Delete(':id')
  @Permissions(Permission.StockOpnames.Delete as PermissionType)
  @UseInterceptors(AuditLogInterceptor)
  @AuditLog({
    module: Module.STOCK_OPNAMES,
    action: AuditAction.DELETE,
    entityType: 'stock_opname',
  })
  @HttpCode(HttpStatus.OK)
  async delete(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.stockOpnameService.delete(id, user.sub);
  }

  @Post('bulk-delete')
  @Permissions(Permission.StockOpnames.Delete as PermissionType)
  @UseInterceptors(AuditLogInterceptor)
  @AuditLog({
    module: Module.STOCK_OPNAMES,
    action: AuditAction.DELETE,
    entityType: 'stock_opname (bulk)',
  })
  @HttpCode(HttpStatus.OK)
  async bulkDelete(
    @Body() body: { ids: string[] },
    @CurrentUser() user: JwtPayload,
  ) {
    return this.stockOpnameService.bulkDelete(body.ids, user.sub);
  }
}
