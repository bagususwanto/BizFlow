import { z } from 'zod';

// ========================================
// Stock Transfer Schemas
// ========================================

const stockTransferItemSchema = z.object({
  variantId: z.string().min(1, 'transfers.validation.variantRequired'),
  requestedQty: z.number().positive('transfers.validation.reqQtyNonZero'),
  notes: z
    .string()
    .max(500, { message: 'transfers.validation.itemNotesMax' })
    .optional()
    .nullable(),
});

export type StockTransferItemValues = z.infer<typeof stockTransferItemSchema>;

export const createStockTransferSchema = z
  .object({
    transferNumber: z.string().optional(),
    fromWarehouseId: z
      .string()
      .min(1, 'transfers.validation.fromWarehouseRequired'),
    toWarehouseId: z
      .string()
      .min(1, 'transfers.validation.toWarehouseRequired'),
    notes: z
      .string()
      .max(1000, { message: 'transfers.validation.notesMax' })
      .optional()
      .nullable(),
    items: z
      .array(stockTransferItemSchema)
      .min(1, 'transfers.validation.itemsMin'),
  })
  .refine((data) => data.fromWarehouseId !== data.toWarehouseId, {
    message: 'transfers.validation.sameWarehouse',
    path: ['toWarehouseId'],
  });

export type CreateStockTransferValues = z.infer<
  typeof createStockTransferSchema
>;

export const updateStockTransferSchema = z.object({
  notes: z
    .string()
    .max(1000, { message: 'transfers.validation.notesMax' })
    .optional()
    .nullable(),
  items: z.array(stockTransferItemSchema).min(1).optional(),
});

export type UpdateStockTransferValues = z.infer<
  typeof updateStockTransferSchema
>;

const receivedItemSchema = z.object({
  transferItemId: z.string().min(1),
  receivedQty: z.number().min(0, 'transfers.validation.receivedQtyNonNegative'),
  notes: z.string().max(500).optional().nullable(),
});

export const updateStockTransferStatusSchema = z.object({
  status: z.enum(['sent', 'received', 'cancelled'], {
    errorMap: () => ({
      message: 'transfers.validation.statusRequired',
    }),
  }),
  notes: z
    .string()
    .max(500, { message: 'transfers.validation.statusNotesMax' })
    .optional()
    .nullable(),
  receivedItems: z.array(receivedItemSchema).optional(),
});

export type UpdateStockTransferStatusValues = z.infer<
  typeof updateStockTransferStatusSchema
>;

export const queryStockTransfersSchema = z.object({
  page: z.string().optional().transform(Number),
  pageSize: z.string().optional().transform(Number),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
  search: z.string().optional(),
  fromWarehouseId: z.string().optional(),
  toWarehouseId: z.string().optional(),
  status: z.enum(['draft', 'sent', 'received', 'cancelled']).optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

export type QueryStockTransfersValues = z.infer<
  typeof queryStockTransfersSchema
>;
