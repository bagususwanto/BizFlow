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
import type { JwtPayload } from '../auth/strategies/jwt.strategy';
import {
  Permission,
  type PermissionType,
  Module,
  AuditAction,
} from '@bizflow/types';

import { PrintersService } from './printers.service';
import {
  CreatePrinterDto,
  UpdatePrinterDto,
  QueryPrintersDto,
  PrintReceiptDto,
} from './dto';

@Controller('core/printers')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class PrintersController {
  constructor(private readonly printersService: PrintersService) {}

  /**
   * Get all printers with filters
   */
  @Get()
  @Permissions(Permission.Settings.Read)
  async findAll(@Query() query: QueryPrintersDto) {
    return this.printersService.findAll(query);
  }

  /**
   * Get a single printer by ID
   */
  @Get(':id')
  @Permissions(Permission.Settings.Read)
  async findById(@Param('id') id: string) {
    return this.printersService.findById(id);
  }

  /**
   * Create a new printer
   */
  @Post()
  @Permissions(Permission.Settings.Update as PermissionType)
  @UseInterceptors(AuditLogInterceptor)
  @AuditLog({
    module: Module.SETTINGS,
    action: AuditAction.CREATE,
    entityType: 'printer',
  })
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() dto: CreatePrinterDto, @CurrentUser() user: JwtPayload) {
    return this.printersService.create(dto, user.sub);
  }

  /**
   * Update an existing printer
   */
  @Patch(':id')
  @Permissions(Permission.Settings.Update as PermissionType)
  @UseInterceptors(AuditLogInterceptor)
  @AuditLog({
    module: Module.SETTINGS,
    action: AuditAction.UPDATE,
    entityType: 'printer',
  })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdatePrinterDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.printersService.update(id, dto, user.sub);
  }

  /**
   * Delete a printer
   */
  @Delete(':id')
  @Permissions(Permission.Settings.Update as PermissionType)
  @UseInterceptors(AuditLogInterceptor)
  @AuditLog({
    module: Module.SETTINGS,
    action: AuditAction.DELETE,
    entityType: 'printer',
  })
  @HttpCode(HttpStatus.OK)
  async delete(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.printersService.delete(id, user.sub);
  }

  /**
   * Bulk delete printers
   */
  @Post('bulk-delete')
  @Permissions(Permission.Settings.Update as PermissionType)
  @AuditLog({
    module: Module.SETTINGS,
    action: AuditAction.DELETE,
    entityType: 'printer (bulk)',
  })
  @HttpCode(HttpStatus.OK)
  async bulkDelete(@Body() body: { ids: string[] }) {
    return this.printersService.bulkDelete(body.ids);
  }

  /**
   * Test print to printer
   */
  @Post(':id/test')
  @Permissions(Permission.Settings.Update as PermissionType)
  async testPrint(@Param('id') id: string) {
    return this.printersService.testPrint(id);
  }

  /**
   * Open cash drawer
   */
  @Post(':id/cash-drawer')
  @Permissions(Permission.Settings.Update as PermissionType)
  async openCashDrawer(@Param('id') id: string) {
    return this.printersService.openCashDrawer(id);
  }

  /**
   * Print receipt for transaction
   */
  @Post('print-receipt')
  @Permissions(Permission.Pos.Read)
  async printReceipt(@Body() dto: PrintReceiptDto) {
    return this.printersService.printReceipt(
      dto.transactionId,
      dto.printerId,
      dto.outletId,
    );
  }
}
