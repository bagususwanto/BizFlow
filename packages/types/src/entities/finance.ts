import type { BaseEntity, ActiveEntity, Decimal } from './base';

// ========================================
// Account Entity
// ========================================

export interface Account extends ActiveEntity {
  code: string;
  name: string;
  type: string;
  balance: Decimal;
  bankName?: string | null;
  accountNumber?: string | null;
}

// ========================================
// Expense Category Entity
// ========================================

export interface ExpenseCategory extends ActiveEntity {
  name: string;
  description?: string | null;
}

// ========================================
// Transaction Entity
// ========================================

export interface Transaction {
  id: string;
  transactionNumber: string;
  accountId: string;
  categoryId?: string | null;
  type: string;
  amount: Decimal;
  transactionDate: Date;
  description?: string | null;
  referenceType?: string | null;
  referenceId?: string | null;
  createdBy: string;
  createdAt: Date;

  // Relations
  account?: Account;
  category?: ExpenseCategory | null;
}

// ========================================
// DTOs for Finance Operations
// ========================================

export interface CreateAccountInput {
  code: string;
  name: string;
  type: string;
  balance?: number | string;
  bankName?: string;
  accountNumber?: string;
}

export interface UpdateAccountInput {
  name?: string;
  type?: string;
  bankName?: string;
  accountNumber?: string;
  isActive?: boolean;
}

export interface CreateExpenseCategoryInput {
  name: string;
  description?: string;
}

export interface CreateTransactionInput {
  accountId: string;
  categoryId?: string;
  type: string;
  amount: number | string;
  transactionDate?: Date | string;
  description?: string;
  referenceType?: string;
  referenceId?: string;
}

export interface TransferFundsInput {
  fromAccountId: string;
  toAccountId: string;
  amount: number | string;
  description?: string;
}
