import { z } from 'zod';

const purchaseOrderItemSchema = z.object({
  variantId: z.string().min(1, 'Product variant wajib dipilih'),
  quantity: z.number().positive('Quantity harus lebih dari 0'),
  unitPrice: z.number().nonnegative('Unit price tidak boleh negatif'),
  notes: z.string().optional().nullable(),
});

const purchaseOrderBaseSchema = z.object({
  orderNumber: z.string().optional(),
  supplierId: z.string().min(1, 'Supplier wajib dipilih'),
  expectedDate: z.string().datetime().or(z.date()).optional().nullable(),
  status: z
    .enum(['draft', 'ordered', 'received', 'completed', 'cancelled'])
    .optional()
    .default('draft'),
  discountPercent: z.number().min(0).max(100).optional().default(0),
  discountAmount: z.number().nonnegative().optional().default(0),
  taxPercent: z.number().min(0).max(100).optional().default(0),
  notes: z.string().optional().nullable(),
  items: z.array(purchaseOrderItemSchema).min(1, 'Minimal 1 item diperlukan'),
});

export const createPurchaseOrderSchema = purchaseOrderBaseSchema;

export const updatePurchaseOrderSchema = purchaseOrderBaseSchema
  .omit({ status: true })
  .partial()
  .extend({
    items: z.array(purchaseOrderItemSchema).min(1).optional(),
  });

export const queryPurchaseOrdersSchema = z.object({
  page: z.string().optional().transform(Number),
  pageSize: z.string().optional().transform(Number),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
  search: z.string().optional(),
  status: z
    .enum(['draft', 'ordered', 'received', 'completed', 'cancelled'])
    .optional(),
  paymentStatus: z.enum(['unpaid', 'partial', 'paid']).optional(),
  supplierId: z.string().optional(),
});

export const updatePurchaseOrderStatusSchema = z.object({
  status: z.enum(['draft', 'ordered', 'received', 'completed', 'cancelled']),
});

export type CreatePurchaseOrderValues = z.infer<
  typeof createPurchaseOrderSchema
>;
export type UpdatePurchaseOrderValues = z.infer<
  typeof updatePurchaseOrderSchema
>;
export type QueryPurchaseOrdersValues = z.infer<
  typeof queryPurchaseOrdersSchema
>;
export type UpdatePurchaseOrderStatusValues = z.infer<
  typeof updatePurchaseOrderStatusSchema
>;
