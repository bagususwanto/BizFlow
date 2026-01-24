import type {
  BaseEntity,
  ActiveEntity,
  Decimal,
  ApprovableEntity,
} from './base';
import type { ProductVariant } from './product';

// ========================================
// Customer Entity
// ========================================

export interface Customer extends ActiveEntity {
  code: string;
  name: string;
  phone?: string | null;
  email?: string | null;
  address?: string | null;
  taxId?: string | null;
  creditLimit: Decimal;
  priceLevelId?: string | null;
}

export interface CustomerListResponse {
  data: Customer[];
  meta: {
    totalItems: number;
    page: number;
    pageSize: number;
    totalPages: number;
  };
  summary: {
    totalCustomers: number;
    activeCustomers: number;
    inactiveCustomers: number;
  };
}

// ========================================
// Sales Order Entities
// ========================================

export interface SalesOrder extends BaseEntity {
  orderNumber: string;
  customerId?: string | null;
  userId: string;
  outletId: string;
  orderDate: Date;
  dueDate?: Date | null;
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

  // Relations
  customer?: Customer | null;
  items?: SalesOrderItem[];
  payments?: Payment[];
  returns?: SalesReturn[];
}

export interface SalesOrderItem {
  id: string;
  orderId: string;
  variantId: string;
  quantity: Decimal;
  unitPrice: Decimal;
  discountPercent: Decimal;
  discountAmount: Decimal;
  subtotal: Decimal;
  notes?: string | null;

  // Relations
  order?: SalesOrder;
  variant?: ProductVariant;
}

export interface SalesReturn extends BaseEntity, ApprovableEntity {
  returnNumber: string;
  orderId: string;
  status: string;
  reason: string;
  refundMethod?: string | null;
  refundAmount: Decimal;
  notes?: string | null;
  createdBy: string;

  // Relations
  order?: SalesOrder;
  items?: SalesReturnItem[];
}

export interface SalesReturnItem {
  id: string;
  returnId: string;
  orderItemId: string;
  quantity: Decimal;
  reason?: string | null;
}

// ========================================
// Payment Entity
// ========================================

export interface Payment {
  id: string;
  paymentNumber: string;
  orderId?: string | null;
  customerId?: string | null;
  accountId: string;
  paymentDate: Date;
  paymentMethod: string;
  amount: Decimal;
  reference?: string | null;
  notes?: string | null;
  createdAt: Date;
}

// ========================================
// DTOs for Sales Operations
// ========================================

export interface CreateCustomerInput {
  code: string;
  name: string;
  phone?: string;
  email?: string;
  address?: string;
  taxId?: string;
  creditLimit?: number | string;
  priceLevelId?: string;
}

export interface UpdateCustomerInput {
  name?: string;
  phone?: string;
  email?: string;
  address?: string;
  taxId?: string;
  creditLimit?: number | string;
  priceLevelId?: string;
  isActive?: boolean;
}

export interface CreateSalesOrderInput {
  customerId?: string;
  outletId: string;
  dueDate?: Date | string;
  notes?: string;
  items: CreateSalesOrderItemInput[];
  discountPercent?: number;
  discountAmount?: number;
  taxPercent?: number;
}

export interface CreateSalesOrderItemInput {
  variantId: string;
  quantity: number;
  unitPrice?: number;
  discountPercent?: number;
  discountAmount?: number;
  notes?: string;
}

export interface CreatePaymentInput {
  orderId?: string;
  customerId?: string;
  accountId: string;
  paymentMethod: string;
  amount: number | string;
  reference?: string;
  notes?: string;
}

export interface CreateSalesReturnInput {
  orderId: string;
  reason: string;
  refundMethod?: string;
  notes?: string;
  items: { orderItemId: string; quantity: number; reason?: string }[];
}
