import { z } from 'zod';

// ========================================
// Return/Refund Schemas
// ========================================

// ========================================
// Return Item Schema
// ========================================

export const returnItemSchema = z.object({
  orderItemId: z.string().min(1, { message: 'Order item ID wajib diisi' }),
  quantity: z.coerce
    .number()
    .positive({ message: 'Jumlah return harus lebih dari 0' }),
  reason: z
    .string()
    .max(500, { message: 'Alasan maksimal 500 karakter' })
    .optional(),
});

export type ReturnItemValues = z.infer<typeof returnItemSchema>;

// ========================================
// Create Return Schema
// ========================================

export const createReturnSchema = z.object({
  orderId: z.string().min(1, { message: 'Order ID wajib diisi' }),
  items: z
    .array(returnItemSchema)
    .min(1, { message: 'Minimal 1 item harus di-return' }),
  reason: z.string().min(1, { message: 'Alasan return wajib diisi' }),
  refundMethod: z
    .enum(['cash', 'credit', 'transfer', 'exchange'], {
      message: 'Metode refund tidak valid',
    })
    .optional(),
  notes: z
    .string()
    .max(1000, { message: 'Catatan maksimal 1000 karakter' })
    .optional(),
});

export type CreateReturnValues = z.infer<typeof createReturnSchema>;

// ========================================
// Query Returns Schema
// ========================================

export const queryReturnsSchema = z.object({
  // Pagination
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(10),

  // Sorting
  sortBy: z
    .enum(['createdAt', 'returnNumber', 'refundAmount', 'approvedAt'])
    .default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),

  // Filters
  search: z.string().optional(), // Search by return number or order number
  orderId: z.string().optional(),
  status: z.enum(['pending', 'approved', 'rejected', 'completed']).optional(),
  startDate: z.string().optional(), // ISO date string
  endDate: z.string().optional(), // ISO date string
});

export type QueryReturnsValues = z.infer<typeof queryReturnsSchema>;

// ========================================
// Process Return Refund Schema
// ========================================

export const processReturnRefundSchema = z.object({
  refundMethod: z.enum(['cash', 'credit', 'transfer'], {
    message: 'Metode refund tidak valid',
  }),
  accountId: z.string().min(1, { message: 'Akun refund wajib dipilih' }),
  notes: z
    .string()
    .max(500, { message: 'Catatan maksimal 500 karakter' })
    .optional(),
});

export type ProcessReturnRefundValues = z.infer<
  typeof processReturnRefundSchema
>;

// ========================================
// Approve/Reject Return Schema
// ========================================

export const approveReturnSchema = z.object({
  notes: z
    .string()
    .max(500, { message: 'Catatan maksimal 500 karakter' })
    .optional(),
});

export type ApproveReturnValues = z.infer<typeof approveReturnSchema>;

export const rejectReturnSchema = z.object({
  reason: z.string().min(1, { message: 'Alasan penolakan wajib diisi' }),
  notes: z
    .string()
    .max(500, { message: 'Catatan maksimal 500 karakter' })
    .optional(),
});

export type RejectReturnValues = z.infer<typeof rejectReturnSchema>;
