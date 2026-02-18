import { z } from 'zod';

// ========================================
// Purchase Return Schemas
// ========================================

const purchaseReturnItemSchema = z.object({
  variantId: z.string().min(1, 'Product variant wajib dipilih'),
  quantity: z.number().positive('Quantity harus lebih dari 0'),
  reason: z
    .string()
    .max(500, { message: 'Alasan maksimal 500 karakter' })
    .optional()
    .nullable(),
});

export type PurchaseReturnItemValues = z.infer<typeof purchaseReturnItemSchema>;

export const createPurchaseReturnSchema = z.object({
  returnNumber: z.string().optional(),
  orderId: z.string().min(1, 'Purchase Order wajib dipilih'),
  reason: z.string().min(1, 'Alasan return wajib diisi'),
  notes: z
    .string()
    .max(1000, { message: 'Catatan maksimal 1000 karakter' })
    .optional()
    .nullable(),
  items: z
    .array(purchaseReturnItemSchema)
    .min(1, 'Minimal 1 item harus di-return'),
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
    .max(500, { message: 'Catatan maksimal 500 karakter' })
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
  status: z.enum(['pending', 'approved', 'rejected', 'completed']).optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

export type QueryPurchaseReturnsValues = z.infer<
  typeof queryPurchaseReturnsSchema
>;
