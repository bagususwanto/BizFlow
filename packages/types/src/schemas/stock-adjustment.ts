import { z } from 'zod';

// ========================================
// Stock Adjustment Schemas
// ========================================

const stockAdjustmentItemSchema = z.object({
  variantId: z
    .string()
    .min(1, 'inventory.adjustments.validation.variantRequired'),
  adjustmentQty: z
    .number()
    .refine((v) => v !== 0, 'inventory.adjustments.validation.adjQtyNonZero'),
  notes: z
    .string()
    .max(500, { message: 'inventory.adjustments.validation.itemNotesMax' })
    .optional()
    .nullable(),
});

export type StockAdjustmentItemValues = z.infer<
  typeof stockAdjustmentItemSchema
>;

export const createStockAdjustmentSchema = z.object({
  adjustmentNumber: z.string().optional(),
  warehouseId: z
    .string()
    .min(1, 'inventory.adjustments.validation.warehouseRequired'),
  type: z.enum(['increase', 'decrease', 'correction'], {
    errorMap: () => ({
      message: 'inventory.adjustments.validation.typeRequired',
    }),
  }),
  reason: z.enum(
    ['damaged', 'expired', 'lost', 'theft', 'correction', 'other'],
    {
      errorMap: () => ({
        message: 'inventory.adjustments.validation.reasonRequired',
      }),
    },
  ),
  notes: z
    .string()
    .max(1000, { message: 'inventory.adjustments.validation.notesMax' })
    .optional()
    .nullable(),
  items: z
    .array(stockAdjustmentItemSchema)
    .min(1, 'inventory.adjustments.validation.itemsMin'),
});

export type CreateStockAdjustmentValues = z.infer<
  typeof createStockAdjustmentSchema
>;

export const updateStockAdjustmentSchema = createStockAdjustmentSchema
  .omit({ warehouseId: true })
  .partial()
  .extend({
    items: z.array(stockAdjustmentItemSchema).min(1).optional(),
  });

export type UpdateStockAdjustmentValues = z.infer<
  typeof updateStockAdjustmentSchema
>;

export const updateStockAdjustmentStatusSchema = z.object({
  status: z.enum(['pending', 'approved', 'rejected'], {
    errorMap: () => ({
      message: 'inventory.adjustments.validation.statusRequired',
    }),
  }),
  notes: z
    .string()
    .max(500, { message: 'inventory.adjustments.validation.statusNotesMax' })
    .optional()
    .nullable(),
});

export type UpdateStockAdjustmentStatusValues = z.infer<
  typeof updateStockAdjustmentStatusSchema
>;

export const queryStockAdjustmentsSchema = z.object({
  page: z.string().optional().transform(Number),
  pageSize: z.string().optional().transform(Number),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
  search: z.string().optional(),
  warehouseId: z.string().optional(),
  type: z.enum(['increase', 'decrease', 'correction']).optional(),
  reason: z
    .enum(['damaged', 'expired', 'lost', 'theft', 'correction', 'other'])
    .optional(),
  status: z.enum(['draft', 'pending', 'approved', 'rejected']).optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

export type QueryStockAdjustmentsValues = z.infer<
  typeof queryStockAdjustmentsSchema
>;
