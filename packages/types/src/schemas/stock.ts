import { z } from 'zod';

// ========================================
// Query Stock Schema
// ========================================

export const queryStockSchema = z.object({
  page: z.coerce.number().int().positive().optional(),
  pageSize: z.coerce.number().int().positive().optional(),
  search: z.string().optional(),
  warehouseId: z.string().optional(),
  categoryId: z.string().optional(),
  hasStock: z.coerce.boolean().optional(),
  sortBy: z
    .enum(['name', 'quantity', 'warehouse', 'sku', 'updatedAt'])
    .optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
});

export type QueryStockValues = z.infer<typeof queryStockSchema>;

// ========================================
// Query Stock Movement Schema
// ========================================

export const queryStockMovementSchema = z.object({
  page: z.coerce.number().int().positive().optional(),
  pageSize: z.coerce.number().int().positive().optional(),
  search: z.string().optional(),
  warehouseId: z.string().optional(),
  variantId: z.string().optional(),
  type: z.string().optional(), // SALE, PURCHASE, ADJUSTMENT, TRANSFER_IN, TRANSFER_OUT, OPNAME
  dateFrom: z.string().optional(), // ISO date string
  dateTo: z.string().optional(), // ISO date string
  sortBy: z.enum(['createdAt', 'type', 'quantity']).optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
});

export type QueryStockMovementValues = z.infer<typeof queryStockMovementSchema>;

// ========================================
// Query Stock Card Schema
// ========================================

export const queryStockCardSchema = z.object({
  warehouseId: z.string().optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
});

export type QueryStockCardValues = z.infer<typeof queryStockCardSchema>;
