import type { BaseEntity, ActiveEntity, Decimal, JsonValue } from './base';

// ========================================
// Category & Unit Entities
// ========================================

export interface Category extends ActiveEntity {
  name: string;
  parentId?: string | null;
  description?: string | null;

  // Relations
  parent?: Category | null;
  children?: Category[];
  products?: Product[];
}

export interface UnitOfMeasure {
  id: string;
  name: string;
  symbol: string;
  baseUnitId?: string | null;
  conversionRate?: number | null;
  createdAt: Date;

  // Relations
  baseUnit?: UnitOfMeasure | null;
  derivedUnits?: UnitOfMeasure[];
}

// ========================================
// Product Entities
// ========================================

export interface Product extends ActiveEntity {
  sku: string;
  barcode?: string | null;
  name: string;
  description?: string | null;
  categoryId: string;
  unitId: string;
  costPrice: Decimal;
  sellPrice: Decimal;
  minStock: number;
  isService: boolean;
  imageUrl?: string | null;

  // Relations
  category?: Category;
  unit?: UnitOfMeasure;
  variants?: ProductVariant[];
  priceLevels?: PriceLevel[];
}

export interface ProductVariant extends ActiveEntity {
  productId: string;
  sku: string;
  barcode?: string | null;
  name: string;
  attributes: JsonValue;
  costPrice: Decimal;
  sellPrice: Decimal;

  // Relations
  product?: Product;
  stocks?: Stock[];
}

export interface PriceLevel {
  id: string;
  productId: string;
  name: string;
  minQty: number;
  price: Decimal;

  // Relations
  product?: Product;
}

// ========================================
// Warehouse & Stock Entities
// ========================================

export interface Warehouse extends ActiveEntity {
  code: string;
  name: string;
  address?: string | null;
  isDefault: boolean;
}

export interface Stock {
  id: string;
  variantId: string;
  warehouseId: string;
  quantity: Decimal;
  reservedQty: Decimal;
  updatedAt: Date;

  // Relations
  variant?: ProductVariant;
  warehouse?: Warehouse;
}

export interface StockMovement {
  id: string;
  variantId: string;
  warehouseId: string;
  type: string;
  quantity: Decimal;
  referenceType?: string | null;
  referenceId?: string | null;
  notes?: string | null;
  createdAt: Date;
  createdBy: string;

  // Relations
  variant?: ProductVariant;
  warehouse?: Warehouse;
}

// ========================================
// DTOs for Product Operations
// ========================================

export interface CreateCategoryInput {
  name: string;
  parentId?: string;
  description?: string;
}

export interface UpdateCategoryInput {
  name?: string;
  parentId?: string | null;
  description?: string;
  isActive?: boolean;
}

export interface CreateUnitInput {
  name: string;
  symbol: string;
  baseUnitId?: string;
  conversionRate?: number;
}

export interface CreateProductInput {
  sku: string;
  barcode?: string;
  name: string;
  description?: string;
  categoryId: string;
  unitId: string;
  costPrice: number | string;
  sellPrice: number | string;
  minStock?: number;
  isService?: boolean;
  imageUrl?: string;
}

export interface UpdateProductInput {
  sku?: string;
  barcode?: string;
  name?: string;
  description?: string;
  categoryId?: string;
  unitId?: string;
  costPrice?: number | string;
  sellPrice?: number | string;
  minStock?: number;
  isService?: boolean;
  isActive?: boolean;
  imageUrl?: string;
}

export interface CreateVariantInput {
  productId: string;
  sku: string;
  barcode?: string;
  name: string;
  attributes: JsonValue;
  costPrice: number | string;
  sellPrice: number | string;
}

export interface CreatePriceLevelInput {
  productId: string;
  name: string;
  minQty?: number;
  price: number | string;
}
