import type { BaseEntity, Decimal, ApprovableEntity } from './base';
import type { ProductVariant } from './product';
import type { Warehouse } from './warehouse';

// ========================================
// Stock Adjustment Entities
// ========================================

export interface StockAdjustment extends BaseEntity, ApprovableEntity {
  adjustmentNumber: string;
  warehouseId: string;
  type: string;
  reason: string;
  status: string;
  notes?: string | null;
  createdBy: string;

  // Relations
  warehouse?: Warehouse;
  items?: StockAdjustmentItem[];
}

export interface StockAdjustmentItem {
  id: string;
  adjustmentId: string;
  variantId: string;
  systemQty: Decimal;
  adjustmentQty: Decimal;
  notes?: string | null;
}

// ========================================
// Stock Transfer Entities
// ========================================

export interface StockTransfer extends BaseEntity {
  transferNumber: string;
  fromWarehouseId: string;
  toWarehouseId: string;
  status: string;
  notes?: string | null;
  sentBy?: string | null;
  sentAt?: Date | null;
  receivedBy?: string | null;
  receivedAt?: Date | null;
  createdBy: string;

  // Relations
  fromWarehouse?: Warehouse;
  toWarehouse?: Warehouse;
  items?: StockTransferItem[];
}

export interface StockTransferItem {
  id: string;
  transferId: string;
  variantId: string;
  requestedQty: Decimal;
  sentQty: Decimal;
  receivedQty: Decimal;
  notes?: string | null;
}

// ========================================
// Stock Opname Entities
// ========================================

export interface StockOpname extends BaseEntity {
  opnameNumber: string;
  warehouseId: string;
  categoryId?: string | null;
  status: string;
  notes?: string | null;
  finalizedBy?: string | null;
  finalizedAt?: Date | null;
  createdBy: string;

  // Relations
  warehouse?: Warehouse;
  items?: StockOpnameItem[];
}

export interface StockOpnameItem {
  id: string;
  opnameId: string;
  variantId: string;
  systemQty: Decimal;
  countedQty?: Decimal | null;
  difference?: Decimal | null;
  notes?: string | null;

  // Relations
  variant?: ProductVariant;
}

// ========================================
// DTOs for Inventory Operations
// ========================================

export interface CreateStockAdjustmentInput {
  warehouseId: string;
  type: string;
  reason: string;
  notes?: string;
  items: { variantId: string; adjustmentQty: number; notes?: string }[];
}

export interface CreateStockTransferInput {
  fromWarehouseId: string;
  toWarehouseId: string;
  notes?: string;
  items: { variantId: string; requestedQty: number; notes?: string }[];
}

export interface CreateStockOpnameInput {
  warehouseId: string;
  categoryId?: string;
  notes?: string;
}

export interface UpdateStockOpnameItemInput {
  opnameItemId: string;
  countedQty: number;
  notes?: string;
}
