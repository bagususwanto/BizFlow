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
  sortBy: z.enum(['name', 'quantity', 'warehouse', 'sku']).optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
});

export type QueryStockValues = z.infer<typeof queryStockSchema>;
