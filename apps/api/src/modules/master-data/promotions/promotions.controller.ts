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
import { Permissions } from '../../../common/decorators/permissions.decorator';
import { AuditLog } from '../../../common/decorators/audit-log.decorator';
import { AuditLogInterceptor } from '../../../common/interceptors/audit-log.interceptor';
import {
  Permission,
  type PermissionType,
  Module,
  AuditAction,
} from '@bizflow/types';

import { PromotionsService } from './promotions.service';
import {
  CreatePromotionDto,
  UpdatePromotionDto,
  QueryPromotionsDto,
} from './dto';

@Controller('master-data/promotions')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class PromotionsController {
  constructor(private readonly promotionsService: PromotionsService) {}

  /**
   * Get all promotions with pagination and filters
   */
  @Get()
  @Permissions(Permission.Products.Read) // Using Products permission for now
  async findAll(@Query() query: QueryPromotionsDto): Promise<any> {
    return this.promotionsService.findAll(query);
  }

  /**
   * Get active promotions (for POS)
   */
  @Get('active')
  @Permissions(Permission.Products.Read)
  async findActive(): Promise<any> {
    return this.promotionsService.findActive();
  }

  /**
   * Get a single promotion by ID
   */
  @Get(':id')
  @Permissions(Permission.Products.Read)
  async findById(@Param('id') id: string): Promise<any> {
    return this.promotionsService.findById(id);
  }

  /**
   * Create a new promotion
   */
  @Post()
  @Permissions(Permission.Products.Create as PermissionType)
  @UseInterceptors(AuditLogInterceptor)
  @AuditLog({
    module: Module.PRODUCTS,
    action: AuditAction.CREATE,
    entityType: 'promotion',
  })
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() dto: CreatePromotionDto): Promise<any> {
    return this.promotionsService.create(dto);
  }

  /**
   * Update an existing promotion
   */
  @Patch(':id')
  @Permissions(Permission.Products.Update as PermissionType)
  @UseInterceptors(AuditLogInterceptor)
  @AuditLog({
    module: Module.PRODUCTS,
    action: AuditAction.UPDATE,
    entityType: 'promotion',
  })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdatePromotionDto,
  ): Promise<any> {
    return this.promotionsService.update(id, dto);
  }

  /**
   * Delete a promotion
   */
  @Delete(':id')
  @Permissions(Permission.Products.Delete as PermissionType)
  @UseInterceptors(AuditLogInterceptor)
  @AuditLog({
    module: Module.PRODUCTS,
    action: AuditAction.DELETE,
    entityType: 'promotion',
  })
  @HttpCode(HttpStatus.OK)
  async delete(@Param('id') id: string) {
    return this.promotionsService.delete(id);
  }
}
