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

import { ProductsService } from './products.service';
import {
  CreateProductDto,
  UpdateProductDto,
  QueryProductsDto,
  CreateVariantDto,
  UpdateVariantDto,
} from './dto';

@Controller('master-data/products')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  /**
   * Get all products with pagination, filter, and summary
   */
  @Get()
  @Permissions(Permission.Products.Read)
  async findAll(@Query() query: QueryProductsDto) {
    return this.productsService.findAll(query);
  }

  /**
   * Get active products for dropdown/select
   */
  @Get('list/active')
  @Permissions(Permission.Products.Read)
  async findActiveList() {
    return this.productsService.findActiveList();
  }

  /**
   * Get low stock products with pagination
   */
  @Get('low-stock')
  @Permissions(Permission.Products.Read)
  async findLowStock(
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
  ) {
    return this.productsService.findLowStock(
      parseInt(page || '1', 10),
      parseInt(pageSize || '10', 10),
    );
  }

  /**
   * Generate SKU for new product
   */
  @Get('generate-sku')
  @Permissions(Permission.Products.Read)
  async generateSku(@Query('categoryId') categoryId?: string) {
    const sku = await this.productsService.generateSku(categoryId);
    return { data: { sku } };
  }

  /**
   * Get a single product by ID
   */
  @Get(':id')
  @Permissions(Permission.Products.Read)
  async findById(@Param('id') id: string) {
    return this.productsService.findById(id);
  }

  /**
   * Create a new product
   */
  @Post()
  @Permissions(Permission.Products.Create as PermissionType)
  @UseInterceptors(AuditLogInterceptor)
  @AuditLog({
    module: Module.PRODUCTS,
    action: AuditAction.CREATE,
    entityType: 'product',
  })
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() dto: CreateProductDto, @CurrentUser() user: JwtPayload) {
    return this.productsService.create(dto, user.sub);
  }

  /**
   * Update an existing product
   */
  @Patch(':id')
  @Permissions(Permission.Products.Update as PermissionType)
  @UseInterceptors(AuditLogInterceptor)
  @AuditLog({
    module: Module.PRODUCTS,
    action: AuditAction.UPDATE,
    entityType: 'product',
  })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateProductDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.productsService.update(id, dto, user.sub);
  }

  /**
   * Delete a product
   */
  @Delete(':id')
  @Permissions(Permission.Products.Delete as PermissionType)
  @UseInterceptors(AuditLogInterceptor)
  @AuditLog({
    module: Module.PRODUCTS,
    action: AuditAction.DELETE,
    entityType: 'product',
  })
  @HttpCode(HttpStatus.OK)
  async delete(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.productsService.delete(id, user.sub);
  }

  /**
   * Bulk delete products
   */
  @Post('bulk-delete')
  @Permissions(Permission.Products.Delete as PermissionType)
  @UseInterceptors(AuditLogInterceptor)
  @AuditLog({
    module: Module.PRODUCTS,
    action: AuditAction.DELETE,
    entityType: 'product (bulk)',
  })
  @HttpCode(HttpStatus.OK)
  async bulkDelete(
    @Body() body: { ids: string[] },
    @CurrentUser() user: JwtPayload,
  ) {
    return this.productsService.bulkDelete(body.ids, user.sub);
  }

  /**
   * ========================================
   * PRODUCT VARIANT ENDPOINTS
   * ========================================
   */

  /**
   * Generate SKU for new variant
   */
  @Get(':productId/variants/generate-sku')
  @Permissions(Permission.Products.Read)
  async generateVariantSku(@Param('productId') productId: string) {
    const sku = await this.productsService.generateVariantSku(productId);
    return { data: { sku } };
  }

  /**
   * Get all variants for a product
   */
  @Get(':productId/variants')
  @Permissions(Permission.Products.Read)
  async findVariantsByProduct(@Param('productId') productId: string) {
    return this.productsService.findVariantsByProduct(productId);
  }

  /**
   * Get a single variant by ID
   */
  @Get('variants/:id')
  @Permissions(Permission.Products.Read)
  async findVariantById(@Param('id') id: string) {
    return this.productsService.findVariantById(id);
  }

  /**
   * Create a new product variant
   */
  @Post(':productId/variants')
  @Permissions(Permission.Products.Create as PermissionType)
  @UseInterceptors(AuditLogInterceptor)
  @AuditLog({
    module: Module.PRODUCTS,
    action: AuditAction.CREATE,
    entityType: 'product variant',
  })
  @HttpCode(HttpStatus.CREATED)
  async createVariant(
    @Param('productId') productId: string,
    @Body() dto: CreateVariantDto,
  ) {
    return this.productsService.createVariant(productId, dto);
  }

  /**
   * Update a product variant
   */
  @Patch('variants/:id')
  @Permissions(Permission.Products.Update as PermissionType)
  @UseInterceptors(AuditLogInterceptor)
  @AuditLog({
    module: Module.PRODUCTS,
    action: AuditAction.UPDATE,
    entityType: 'product variant',
  })
  async updateVariant(@Param('id') id: string, @Body() dto: UpdateVariantDto) {
    return this.productsService.updateVariant(id, dto);
  }

  /**
   * Delete a product variant
   */
  @Delete('variants/:id')
  @Permissions(Permission.Products.Delete as PermissionType)
  @UseInterceptors(AuditLogInterceptor)
  @AuditLog({
    module: Module.PRODUCTS,
    action: AuditAction.DELETE,
    entityType: 'product variant',
  })
  @HttpCode(HttpStatus.OK)
  async deleteVariant(@Param('id') id: string) {
    return this.productsService.deleteVariant(id);
  }

  /**
   * Bulk delete product variants
   */
  @Post('variants/bulk-delete')
  @Permissions(Permission.Products.Delete as PermissionType)
  @UseInterceptors(AuditLogInterceptor)
  @AuditLog({
    module: Module.PRODUCTS,
    action: AuditAction.DELETE,
    entityType: 'product variant (bulk)',
  })
  @HttpCode(HttpStatus.OK)
  async bulkDeleteVariants(@Body() body: { ids: string[] }) {
    return this.productsService.bulkDeleteVariants(body.ids);
  }
}
