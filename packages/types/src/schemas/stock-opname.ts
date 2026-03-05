import { z } from 'zod';

// ========================================
// Stock Opname Schemas
// ========================================

export const createStockOpnameSchema = z.object({
  opnameNumber: z.string().optional(),
  warehouseId: z
    .string()
    .min(1, 'inventory.opname.validation.warehouseRequired'),
  categoryId: z.string().optional().nullable(),
  notes: z
    .string()
    .max(1000, { message: 'inventory.opname.validation.notesMax' })
    .optional()
    .nullable(),
});

export type CreateStockOpnameValues = z.infer<typeof createStockOpnameSchema>;

// Schema for updating a single opname item's counted quantity
const updateStockOpnameItemSchema = z.object({
  opnameItemId: z.string().min(1, 'inventory.opname.validation.itemIdRequired'),
  countedQty: z
    .number()
    .min(0, 'inventory.opname.validation.countedQtyNonNegative'),
  notes: z
    .string()
    .max(500, { message: 'inventory.opname.validation.itemNotesMax' })
    .optional()
    .nullable(),
});

export type UpdateStockOpnameItemValues = z.infer<
  typeof updateStockOpnameItemSchema
>;

// Schema for batch-updating multiple items
export const updateStockOpnameItemsSchema = z.object({
  items: z
    .array(updateStockOpnameItemSchema)
    .min(1, 'inventory.opname.validation.itemsMin'),
});

export type UpdateStockOpnameItemsValues = z.infer<
  typeof updateStockOpnameItemsSchema
>;

// Schema for finalizing an opname (creates stock adjustments for differences)
export const finalizeStockOpnameSchema = z.object({
  notes: z
    .string()
    .max(1000, { message: 'inventory.opname.validation.notesMax' })
    .optional()
    .nullable(),
});

export type FinalizeStockOpnameValues = z.infer<
  typeof finalizeStockOpnameSchema
>;

// Schema for canceling an opname
export const cancelStockOpnameSchema = z.object({
  notes: z
    .string()
    .max(1000, { message: 'inventory.opname.validation.notesMax' })
    .optional()
    .nullable(),
});

export type CancelStockOpnameValues = z.infer<typeof cancelStockOpnameSchema>;

// Schema for querying / filtering the opname list
export const queryStockOpnamesSchema = z.object({
  page: z.string().optional().transform(Number),
  pageSize: z.string().optional().transform(Number),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
  search: z.string().optional(),
  warehouseId: z.string().optional(),
  status: z.enum(['in_progress', 'finalized', 'cancelled']).optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

export type QueryStockOpnamesValues = z.infer<typeof queryStockOpnamesSchema>;
