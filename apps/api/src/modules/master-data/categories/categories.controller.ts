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
  type PermissionType,
  Module,
  AuditAction,
} from '@bizflow/types';

import { CategoriesService } from './categories.service';
import {
  CreateCategoryDto,
  UpdateCategoryDto,
  QueryCategoriesDto,
} from './dto';

@Controller('master-data/categories')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  /**
   * Get all categories with pagination, filter, and summary
   */
  @Get()
  @Permissions(Permission.Categories.Read)
  async findAll(@Query() query: QueryCategoriesDto) {
    return this.categoriesService.findAll(query);
  }

  /**
   * Get hierarchical tree of categories
   */
  @Get('tree')
  @Permissions(Permission.Categories.Read)
  async findTree() {
    return this.categoriesService.findTree();
  }

  /**
   * Get active categories for dropdown/select
   */
  @Get('list/active')
  @Permissions(Permission.Categories.Read)
  async findActiveList() {
    return this.categoriesService.findActiveList();
  }

  /**
   * Get a single category by ID
   */
  @Get(':id')
  @Permissions(Permission.Categories.Read)
  async findById(@Param('id') id: string) {
    return this.categoriesService.findById(id);
  }

  /**
   * Create a new category
   */
  @Post()
  @Permissions(Permission.Categories.Create as PermissionType)
  @UseInterceptors(AuditLogInterceptor)
  @AuditLog({
    module: Module.CATEGORIES,
    action: AuditAction.CREATE,
    entityType: 'category',
  })
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body() dto: CreateCategoryDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.categoriesService.create(dto, user.sub);
  }

  /**
   * Update an existing category
   */
  @Patch(':id')
  @Permissions(Permission.Categories.Update as PermissionType)
  @UseInterceptors(AuditLogInterceptor)
  @AuditLog({
    module: Module.CATEGORIES,
    action: AuditAction.UPDATE,
    entityType: 'category',
  })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateCategoryDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.categoriesService.update(id, dto, user.sub);
  }

  /**
   * Delete a category
   */
  @Delete(':id')
  @Permissions(Permission.Categories.Delete as PermissionType)
  @UseInterceptors(AuditLogInterceptor)
  @AuditLog({
    module: Module.CATEGORIES,
    action: AuditAction.DELETE,
    entityType: 'category',
  })
  @HttpCode(HttpStatus.OK)
  async delete(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.categoriesService.delete(id, user.sub);
  }

  @Post('bulk-delete')
  @Permissions(Permission.Categories.Delete as PermissionType)
  @UseInterceptors(AuditLogInterceptor)
  @AuditLog({
    module: Module.CATEGORIES,
    action: AuditAction.DELETE,
    entityType: 'category (bulk)',
  })
  @HttpCode(HttpStatus.OK)
  async bulkDelete(
    @Body() body: { ids: string[] },
    @CurrentUser() user: JwtPayload,
  ) {
    return this.categoriesService.bulkDelete(body.ids, user.sub);
  }

  /**
   * Reorder category (change parent and/or index)
   */
  @Patch(':id/reorder')
  @Permissions(Permission.Categories.Update as PermissionType)
  @UseInterceptors(AuditLogInterceptor)
  @AuditLog({
    module: Module.CATEGORIES,
    action: AuditAction.UPDATE,
    entityType: 'category (reorder)',
  })
  async reorder(
    @Param('id') id: string,
    @Body() body: { parentId: string | null; index: number },
    @CurrentUser() user: JwtPayload,
  ) {
    return this.categoriesService.reorder(id, body.parentId, body.index);
  }
}
