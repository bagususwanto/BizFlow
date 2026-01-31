import { z } from 'zod';

// ========================================
// POS Transaction Schemas
// ========================================

// ========================================
// Cart Item Schema
// ========================================

export const posCartItemSchema = z.object({
  variantId: z.string().min(1, { message: 'Varian produk wajib dipilih' }),
  quantity: z.coerce
    .number()
    .positive({ message: 'Jumlah harus lebih dari 0' }),
  unitPrice: z.coerce.number().min(0, { message: 'Harga tidak boleh negatif' }),
  discountPercent: z.coerce
    .number()
    .min(0)
    .max(100, { message: 'Diskon maksimal 100%' })
    .default(0),
  discountAmount: z.coerce
    .number()
    .min(0, { message: 'Diskon tidak boleh negatif' })
    .default(0),
  notes: z.string().optional(),
});

export type POSCartItemValues = z.infer<typeof posCartItemSchema>;

// ========================================
// Payment Schema
// ========================================

export const posPaymentSchema = z.object({
  method: z.enum(['cash', 'qris', 'transfer', 'card'], {
    message: 'Metode pembayaran tidak valid',
  }),
  amount: z.coerce
    .number()
    .positive({ message: 'Jumlah pembayaran harus lebih dari 0' }),
  reference: z.string().optional(),
  accountId: z.string().min(1, { message: 'Akun pembayaran wajib dipilih' }),
});

export type POSPaymentValues = z.infer<typeof posPaymentSchema>;

// ========================================
// Create Transaction Schema
// ========================================

export const createPOSTransactionSchema = z.object({
  outletId: z.string().min(1, { message: 'Outlet wajib dipilih' }),
  customerId: z.string().optional(),
  items: z
    .array(posCartItemSchema)
    .min(1, { message: 'Minimal 1 item harus ada di keranjang' }),
  payments: z
    .array(posPaymentSchema)
    .min(1, { message: 'Minimal 1 metode pembayaran harus dipilih' }),
  discountPercent: z.coerce
    .number()
    .min(0)
    .max(100, { message: 'Diskon maksimal 100%' })
    .default(0),
  discountAmount: z.coerce
    .number()
    .min(0, { message: 'Diskon tidak boleh negatif' })
    .default(0),
  taxPercent: z.coerce
    .number()
    .min(0)
    .max(100, { message: 'Pajak maksimal 100%' })
    .default(0),
  notes: z.string().optional(),
});

export type CreatePOSTransactionValues = z.infer<
  typeof createPOSTransactionSchema
>;

// ========================================
// Query Transactions Schema
// ========================================

export const queryPOSTransactionsSchema = z.object({
  // Pagination
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(10),

  // Sorting
  sortBy: z
    .enum(['orderDate', 'orderNumber', 'total', 'createdAt'])
    .default('orderDate'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),

  // Filters
  search: z.string().optional(), // Search by order number or customer name
  outletId: z.string().optional(),
  customerId: z.string().optional(),
  status: z.enum(['draft', 'completed', 'cancelled']).optional(),
  paymentStatus: z.enum(['unpaid', 'partial', 'paid']).optional(),
  startDate: z.string().optional(), // ISO date string
  endDate: z.string().optional(), // ISO date string
});

export type QueryPOSTransactionsValues = z.infer<
  typeof queryPOSTransactionsSchema
>;

// ========================================
// Search Products Schema
// ========================================

export const searchProductsSchema = z.object({
  query: z.string().min(1, { message: 'Query pencarian wajib diisi' }),
  warehouseId: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(50).default(20),
});

export type SearchProductsValues = z.infer<typeof searchProductsSchema>;

// ========================================
// Hold Transaction Schema
// ========================================

export const holdTransactionSchema = z.object({
  items: z
    .array(posCartItemSchema)
    .min(1, { message: 'Minimal 1 item harus ada di keranjang' }),
  customerId: z.string().optional(),
  note: z
    .string()
    .max(200, { message: 'Catatan maksimal 200 karakter' })
    .optional(),
  discountPercent: z.coerce.number().min(0).max(100).default(0),
  discountAmount: z.coerce.number().min(0).default(0),
});

export type HoldTransactionValues = z.infer<typeof holdTransactionSchema>;
