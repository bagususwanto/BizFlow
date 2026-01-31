import { z } from 'zod';

// ========================================
// Payment Schemas
// ========================================

// ========================================
// Create Payment Schema
// ========================================

export const createPaymentSchema = z.object({
  orderId: z.string().min(1, { message: 'Order ID wajib diisi' }),
  accountId: z.string().min(1, { message: 'Akun pembayaran wajib dipilih' }),
  paymentMethod: z.enum(['cash', 'qris', 'transfer', 'credit', 'debit'], {
    message: 'Metode pembayaran tidak valid',
  }),
  amount: z.coerce
    .number()
    .positive({ message: 'Jumlah pembayaran harus lebih dari 0' }),
  reference: z.string().optional(),
  notes: z
    .string()
    .max(500, { message: 'Catatan maksimal 500 karakter' })
    .optional(),
});

export type CreatePaymentValues = z.infer<typeof createPaymentSchema>;

// ========================================
// Query Payments Schema
// ========================================

export const queryPaymentsSchema = z.object({
  // Pagination
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(10),

  // Sorting
  sortBy: z
    .enum(['paymentDate', 'paymentNumber', 'amount', 'createdAt'])
    .default('paymentDate'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),

  // Filters
  search: z.string().optional(), // Search by payment number or reference
  orderId: z.string().optional(),
  customerId: z.string().optional(),
  paymentMethod: z
    .enum(['cash', 'qris', 'transfer', 'credit', 'debit'])
    .optional(),
  accountId: z.string().optional(),
  startDate: z.string().optional(), // ISO date string
  endDate: z.string().optional(), // ISO date string
});

export type QueryPaymentsValues = z.infer<typeof queryPaymentsSchema>;

// ========================================
// Process Refund Schema
// ========================================

export const processRefundSchema = z.object({
  amount: z.coerce
    .number()
    .positive({ message: 'Jumlah refund harus lebih dari 0' }),
  reason: z.string().min(1, { message: 'Alasan refund wajib diisi' }),
  refundMethod: z.enum(['cash', 'credit', 'transfer'], {
    message: 'Metode refund tidak valid',
  }),
  accountId: z.string().min(1, { message: 'Akun refund wajib dipilih' }),
  notes: z
    .string()
    .max(500, { message: 'Catatan maksimal 500 karakter' })
    .optional(),
});

export type ProcessRefundValues = z.infer<typeof processRefundSchema>;

// ========================================
// Split Payment Validation Schema
// ========================================

export const splitPaymentSchema = z.object({
  totalAmount: z.coerce
    .number()
    .positive({ message: 'Total amount harus lebih dari 0' }),
  payments: z
    .array(
      z.object({
        method: z.enum(['cash', 'qris', 'transfer', 'credit', 'debit']),
        amount: z.coerce.number().positive(),
        accountId: z.string().min(1),
        reference: z.string().optional(),
      }),
    )
    .min(2, { message: 'Split payment minimal 2 metode pembayaran' }),
});

export type SplitPaymentValues = z.infer<typeof splitPaymentSchema>;
