import { z } from 'zod';

// ========================================
// Stock Valuation Schema (HPP / Moving Average)
// ========================================

export const queryStockValuationSchema = z.object({
  page: z.string().optional().transform(Number),
  pageSize: z.string().optional().transform(Number),
  sortBy: z
    .enum(['avgCost', 'totalValue', 'totalQty', 'updatedAt'])
    .optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
  search: z.string().optional(), // search by product name / SKU
  warehouseId: z.string().optional(),
  variantId: z.string().optional(),
  categoryId: z.string().optional(),
});

export type QueryStockValuationValues = z.infer<
  typeof queryStockValuationSchema
>;
