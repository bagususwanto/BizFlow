// ========================================
// User & Access Enums
// ========================================

export enum UserRole {
  OWNER = 'owner',
  ADMIN = 'admin',
  KASIR = 'kasir',
  GUDANG = 'gudang',
}

// System roles that cannot be deleted
export const SYSTEM_ROLES = Object.values(UserRole);
export type SystemRole = UserRole;

export enum AuditAction {
  LOGIN = 'login',
  LOGOUT = 'logout',
  CREATE = 'create',
  READ = 'read',
  UPDATE = 'update',
  DELETE = 'delete',
}

export enum Module {
  AUTH = 'auth',
  DASHBOARD = 'dashboard',
  POS = 'pos',
  PRODUCTS = 'products',
  SALES = 'sales',
  PURCHASES = 'purchases',
  INVENTORY = 'inventory',
  FINANCE = 'finance',
  REPORTS = 'reports',
  SETTINGS = 'settings',
  USERS = 'users',
}

// Helper array for available modules
export const AVAILABLE_MODULES = Object.values(Module);

export const Permission = {
  Dashboard: {
    Read: 'dashboard:read',
    Update: 'dashboard:update',
  },
  Pos: {
    Read: 'pos:read',
    Create: 'pos:create',
    Update: 'pos:update',
    Delete: 'pos:delete',
  },
  Products: {
    Read: 'products:read',
    Create: 'products:create',
    Update: 'products:update',
    Delete: 'products:delete',
  },
  Sales: {
    Read: 'sales:read',
    Create: 'sales:create',
    Update: 'sales:update',
    Delete: 'sales:delete',
  },
  Purchases: {
    Read: 'purchases:read',
    Create: 'purchases:create',
    Update: 'purchases:update',
    Delete: 'purchases:delete',
  },
  Inventory: {
    Read: 'inventory:read',
    Create: 'inventory:create',
    Update: 'inventory:update',
    Delete: 'inventory:delete',
  },
  Finance: {
    Read: 'finance:read',
    Create: 'finance:create',
    Update: 'finance:update',
    Delete: 'finance:delete',
  },
  Reports: {
    Read: 'reports:read',
    Create: 'reports:create',
    Update: 'reports:update',
    Delete: 'reports:delete',
  },
  Settings: {
    Read: 'settings:read',
    Update: 'settings:update',
  },
  Users: {
    Read: 'users:read',
    Create: 'users:create',
    Update: 'users:update',
    Delete: 'users:delete',
  },
} as const;

export type PermissionType =
  (typeof Permission)[keyof typeof Permission][keyof (typeof Permission)[keyof typeof Permission]];

export enum PermissionAction {
  CREATE = 'create',
  READ = 'read',
  UPDATE = 'update',
  DELETE = 'delete',
}

// Helper array for available actions
export const AVAILABLE_ACTIONS = Object.values(PermissionAction);

// ========================================
// Product & Inventory Enums
// ========================================

export enum StockMovementType {
  IN = 'in',
  OUT = 'out',
  ADJUSTMENT = 'adjustment',
  TRANSFER = 'transfer',
}

export enum StockReferenceType {
  SALES_ORDER = 'sales_order',
  PURCHASE_ORDER = 'purchase_order',
  ADJUSTMENT = 'adjustment',
  TRANSFER = 'transfer',
  OPNAME = 'opname',
}

export enum StockAdjustmentType {
  INCREASE = 'increase',
  DECREASE = 'decrease',
  CORRECTION = 'correction',
}

export enum StockAdjustmentReason {
  DAMAGED = 'damaged',
  EXPIRED = 'expired',
  LOST = 'lost',
  THEFT = 'theft',
  CORRECTION = 'correction',
  OTHER = 'other',
}

// ========================================
// Order & Transaction Enums
// ========================================

export enum OrderStatus {
  DRAFT = 'draft',
  CONFIRMED = 'confirmed',
  PROCESSING = 'processing',
  DELIVERED = 'delivered',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

export enum PaymentStatus {
  UNPAID = 'unpaid',
  PARTIAL = 'partial',
  PAID = 'paid',
  REFUNDED = 'refunded',
}

export enum PaymentMethod {
  CASH = 'cash',
  QRIS = 'qris',
  TRANSFER = 'transfer',
  CREDIT = 'credit',
  DEBIT = 'debit',
  SPLIT = 'split',
}

export enum ReturnStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

export enum RefundMethod {
  CASH = 'cash',
  CREDIT = 'credit',
  TRANSFER = 'transfer',
}

// ========================================
// Purchase Enums
// ========================================

export enum PurchaseOrderStatus {
  DRAFT = 'draft',
  CONFIRMED = 'confirmed',
  PARTIAL = 'partial',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

export enum GoodsReceiveStatus {
  PENDING = 'pending',
  RECEIVED = 'received',
  PARTIAL = 'partial',
}

// ========================================
// Inventory Operations Enums
// ========================================

export enum StockTransferStatus {
  DRAFT = 'draft',
  SENT = 'sent',
  RECEIVED = 'received',
  CANCELLED = 'cancelled',
}

export enum StockOpnameStatus {
  IN_PROGRESS = 'in_progress',
  FINALIZED = 'finalized',
  CANCELLED = 'cancelled',
}

export enum ApprovalStatus {
  DRAFT = 'draft',
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  CANCELLED = 'cancelled',
}

// ========================================
// Finance Enums
// ========================================

export enum AccountType {
  CASH = 'cash',
  BANK = 'bank',
  RECEIVABLE = 'receivable',
  PAYABLE = 'payable',
}

export enum TransactionType {
  INCOME = 'income',
  EXPENSE = 'expense',
  TRANSFER = 'transfer',
}

export enum FinanceReferenceType {
  SALES_ORDER = 'sales_order',
  PURCHASE_ORDER = 'purchase_order',
  PAYMENT = 'payment',
  REFUND = 'refund',
}
