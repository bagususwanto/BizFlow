import { z } from 'zod';

// ========================================
// Stock Lot Schemas (Batch/Lot + Expiry)
// ========================================

export const createStockLotSchema = z.object({
  lotNumber: z
    .string()
    .min(1, 'inventory.stockLots.validation.lotNumberRequired'),
  variantId: z
    .string()
    .min(1, 'inventory.stockLots.validation.variantRequired'),
  warehouseId: z
    .string()
    .min(1, 'inventory.stockLots.validation.warehouseRequired'),
  initialQty: z
    .number()
    .positive('inventory.stockLots.validation.initialQtyMin'),
  expiryDate: z.string().datetime().or(z.date()).optional().nullable(),
  manufacturingDate: z.string().datetime().or(z.date()).optional().nullable(),
  notes: z
    .string()
    .max(500, { message: 'inventory.stockLots.validation.notesMax' })
    .optional()
    .nullable(),
});

export type CreateStockLotValues = z.infer<typeof createStockLotSchema>;

export const updateStockLotSchema = z.object({
  expiryDate: z.string().datetime().or(z.date()).optional().nullable(),
  manufacturingDate: z.string().datetime().or(z.date()).optional().nullable(),
  notes: z
    .string()
    .max(500, { message: 'inventory.stockLots.validation.notesMax' })
    .optional()
    .nullable(),
});

export type UpdateStockLotValues = z.infer<typeof updateStockLotSchema>;

export const queryStockLotsSchema = z.object({
  page: z.string().optional().transform(Number),
  pageSize: z.string().optional().transform(Number),
  sortBy: z
    .enum(['lotNumber', 'expiryDate', 'remainingQty', 'createdAt'])
    .optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
  search: z.string().optional(), // search by lotNumber
  variantId: z.string().optional(),
  warehouseId: z.string().optional(),
  expiryBefore: z.string().optional(), // ISO date string
  hasStock: z.coerce.boolean().optional(), // filter: remainingQty > 0
});

export type QueryStockLotsValues = z.infer<typeof queryStockLotsSchema>;
