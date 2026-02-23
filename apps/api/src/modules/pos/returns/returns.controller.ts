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
  type CreateReturnValues,
  type ProcessReturnRefundValues,
  type RejectReturnValues,
} from '@bizflow/types';

import { ReturnsService } from './returns.service';
import {
  CreateReturnDto,
  QueryReturnsDto,
  ProcessReturnRefundDto,
  ApproveReturnDto,
  RejectReturnDto,
} from './dto';

@Controller('pos/returns')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class ReturnsController {
  constructor(private readonly returnsService: ReturnsService) {}

  /**
   * Create new return transaction
   * POST /pos/returns
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @Permissions(Permission.Pos.Create as PermissionType)
  @UseInterceptors(AuditLogInterceptor)
  @AuditLog({
    module: Module.POS,
    action: AuditAction.CREATE,
    entityType: 'pos return',
  })
  async create(@Body() dto: CreateReturnDto, @CurrentUser() user: JwtPayload) {
    return this.returnsService.createReturn(
      dto as CreateReturnValues,
      user.sub,
    );
  }

  /**
   * Get all returns with filters
   * GET /pos/returns
   */
  @Get()
  @Permissions(Permission.Pos.Read as PermissionType)
  async findAll(@Query() query: QueryReturnsDto) {
    return this.returnsService.findAll(query);
  }

  /**
   * Get return by ID
   * GET /pos/returns/:id
   */
  @Get(':id')
  @Permissions(Permission.Pos.Read as PermissionType)
  async findById(@Param('id') id: string) {
    return this.returnsService.findById(id);
  }

  /**
   * Process refund for approved return
   * POST /pos/returns/:id/refund
   */
  @Post(':id/refund')
  @HttpCode(HttpStatus.OK)
  @Permissions(Permission.Sales.Refund as PermissionType)
  @UseInterceptors(AuditLogInterceptor)
  @AuditLog({
    module: Module.POS,
    action: AuditAction.CREATE,
    entityType: 'return refund',
  })
  async processRefund(
    @Param('id') id: string,
    @Body() dto: ProcessReturnRefundDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.returnsService.processRefund(
      id,
      dto as ProcessReturnRefundValues,
      user.sub,
    );
  }

  /**
   * Approve return
   * POST /pos/returns/:id/approve
   */
  @Post(':id/approve')
  @HttpCode(HttpStatus.OK)
  @Permissions(Permission.Pos.Approve as PermissionType)
  @UseInterceptors(AuditLogInterceptor)
  @AuditLog({
    module: Module.POS,
    action: AuditAction.UPDATE,
    entityType: 'pos return',
  })
  async approve(
    @Param('id') id: string,
    @Body() dto: ApproveReturnDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.returnsService.approveReturn(id, dto, user.sub);
  }

  /**
   * Reject return
   * POST /pos/returns/:id/reject
   */
  @Post(':id/reject')
  @HttpCode(HttpStatus.OK)
  @Permissions(Permission.Pos.Reject as PermissionType)
  @UseInterceptors(AuditLogInterceptor)
  @AuditLog({
    module: Module.POS,
    action: AuditAction.UPDATE,
    entityType: 'pos return',
  })
  async reject(
    @Param('id') id: string,
    @Body() dto: RejectReturnDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.returnsService.rejectReturn(
      id,
      dto as RejectReturnValues,
      user.sub,
    );
  }
}
