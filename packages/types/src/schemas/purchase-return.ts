import { z } from 'zod';

// ========================================
// Purchase Return Schemas
// ========================================

const purchaseReturnItemSchema = z.object({
  variantId: z.string().min(1, 'purchases.returns.validation.variantRequired'),
  quantity: z.number().positive('purchases.returns.validation.qtyPositive'),
  reason: z
    .string()
    .max(500, { message: 'purchases.returns.validation.reasonMax' })
    .optional()
    .nullable(),
});

export type PurchaseReturnItemValues = z.infer<typeof purchaseReturnItemSchema>;

export const createPurchaseReturnSchema = z.object({
  returnNumber: z.string().optional(),
  orderId: z.string().min(1, 'purchases.returns.validation.poRequired'),
  reason: z.string().min(1, 'purchases.returns.validation.reasonRequired'),
  notes: z
    .string()
    .max(1000, { message: 'purchases.returns.validation.notesMax' })
    .optional()
    .nullable(),
  items: z
    .array(purchaseReturnItemSchema)
    .min(1, 'purchases.returns.validation.itemsMin'),
});

export type CreatePurchaseReturnValues = z.infer<
  typeof createPurchaseReturnSchema
>;

export const updatePurchaseReturnSchema = createPurchaseReturnSchema
  .omit({ orderId: true })
  .partial()
  .extend({
    items: z.array(purchaseReturnItemSchema).min(1).optional(),
  });

export type UpdatePurchaseReturnValues = z.infer<
  typeof updatePurchaseReturnSchema
>;

export const updatePurchaseReturnStatusSchema = z.object({
  status: z.enum(['pending', 'approved', 'rejected', 'completed']),
  notes: z
    .string()
    .max(500, { message: 'purchases.returns.validation.statusNotesMax' })
    .optional()
    .nullable(),
});

export type UpdatePurchaseReturnStatusValues = z.infer<
  typeof updatePurchaseReturnStatusSchema
>;

export const queryPurchaseReturnsSchema = z.object({
  page: z.string().optional().transform(Number),
  pageSize: z.string().optional().transform(Number),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
  search: z.string().optional(),
  orderId: z.string().optional(),
  supplierId: z.string().optional(),
  status: z.enum(['pending', 'approved', 'rejected', 'completed']).optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

export type QueryPurchaseReturnsValues = z.infer<
  typeof queryPurchaseReturnsSchema
>;
