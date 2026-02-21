import type {
  BaseEntity,
  ActiveEntity,
  Decimal,
  ApprovableEntity,
} from './base';
import type { ProductVariant } from './product';
import type { Warehouse } from './warehouse';
import type { Account } from './finance';
import type { User } from './user';
import type { PaymentTerm } from './payment-term';

// ========================================
// Supplier Entity
// ========================================

export interface Supplier extends ActiveEntity {
  code: string;
  name: string;
  phone?: string | null;
  email?: string | null;
  address?: string | null;
  taxId?: string | null;
  paymentTermId?: string | null;
  paymentTerm?: PaymentTerm | null;
  bankName?: string | null;
  bankAccount?: string | null;
}

// ========================================
// Purchase Order Entities
// ========================================

export interface PurchaseOrder extends BaseEntity, ApprovableEntity {
  orderNumber: string;
  supplierId: string;
  expectedDate?: Date | null;
  status: string;
  paymentStatus: string;

  subtotal: Decimal;
  discountPercent: Decimal;
  discountAmount: Decimal;
  taxPercent: Decimal;
  taxAmount: Decimal;
  total: Decimal;
  paidAmount: Decimal;

  notes?: string | null;
  createdBy: string;

  // Relations
  supplier?: Supplier;
  items?: PurchaseOrderItem[];
  goodsReceives?: GoodsReceive[];
  returns?: PurchaseReturn[];
  payments?: SupplierPayment[];
  creator?: User;
  approver?: User;
}

export interface PurchaseOrderItem {
  id: string;
  orderId: string;
  variantId: string;
  quantity: Decimal;
  receivedQty: Decimal;
  unitPrice: Decimal;
  subtotal: Decimal;
  notes?: string | null;

  // Relations
  order?: PurchaseOrder;
  variant?: ProductVariant;
}

export interface GoodsReceive {
  id: string;
  receiveNumber: string;
  purchaseOrderId: string;
  warehouseId: string;
  receiveDate: Date;
  notes?: string | null;
  createdBy: string;
  createdAt: Date;

  // Relations
  purchaseOrder?: PurchaseOrder;
  warehouse?: Warehouse;
  items?: GoodsReceiveItem[];
  creator?: User;
}

export interface GoodsReceiveItem {
  id: string;
  receiveId: string;
  purchaseOrderItemId: string;
  receivedQty: Decimal;
  notes?: string | null;
}

export interface PurchaseReturn extends BaseEntity, ApprovableEntity {
  returnNumber: string;
  orderId: string;
  status: string;
  reason: string;
  returnAmount: Decimal;
  notes?: string | null;
  createdBy: string;

  // Relations
  order?: PurchaseOrder;
  items?: PurchaseReturnItem[];
  creator?: User;
  approver?: User;
}

export interface PurchaseReturnItem {
  id: string;
  returnId: string;
  variantId: string;
  quantity: Decimal;
  reason?: string | null;

  // Relations
  variant?: ProductVariant;
}

export interface SupplierPayment {
  id: string;
  paymentNumber: string;
  supplierId: string;
  purchaseOrderId?: string | null;
  accountId: string;
  paymentMethod: string;
  paymentDate: Date;
  amount: Decimal;
  reference?: string | null;
  notes?: string | null;
  createdBy: string;
  createdAt: Date;

  // Relations
  supplier?: Supplier;
  purchaseOrder?: PurchaseOrder | null;
  account?: Account;
  creator?: User;
}

// ========================================
// DTOs for Purchase Operations
// ========================================

export interface CreateSupplierInput {
  code: string;
  name: string;
  phone?: string;
  email?: string;
  address?: string;
  taxId?: string;
  paymentTermId?: string;
  bankName?: string;
  bankAccount?: string;
}

export interface UpdateSupplierInput {
  name?: string;
  phone?: string;
  email?: string;
  address?: string;
  taxId?: string;
  paymentTermId?: string;
  bankName?: string;
  bankAccount?: string;
  isActive?: boolean;
}

export interface CreatePurchaseOrderInput {
  supplierId: string;
  expectedDate?: Date | string;
  notes?: string;
  items: CreatePurchaseOrderItemInput[];
  discountPercent?: number;
  discountAmount?: number;
  taxPercent?: number;
}

export interface CreatePurchaseOrderItemInput {
  variantId: string;
  quantity: number;
  unitPrice: number;
  notes?: string;
}

export interface CreateGoodsReceiveInput {
  purchaseOrderId: string;
  warehouseId: string;
  notes?: string;
  items: { purchaseOrderItemId: string; receivedQty: number; notes?: string }[];
}

export interface CreateSupplierPaymentInput {
  supplierId: string;
  purchaseOrderId?: string;
  accountId: string;
  amount: number | string;
  reference?: string;
  notes?: string;
}
