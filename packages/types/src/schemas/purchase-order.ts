import { z } from 'zod';

const purchaseOrderItemSchema = z.object({
  variantId: z.string().min(1, 'purchases.orders.validation.variantRequired'),
  quantity: z.number().positive('purchases.orders.validation.quantityMin'),
  unitPrice: z.number().nonnegative('purchases.orders.validation.priceMin'),
  notes: z.string().optional().nullable(),
});

const purchaseOrderBaseSchema = z.object({
  orderNumber: z.string().optional(),
  supplierId: z.string().min(1, 'purchases.orders.validation.supplierRequired'),
  expectedDate: z.string().datetime().or(z.date()).optional().nullable(),
  status: z
    .enum([
      'draft',
      'pending_approval',
      'approved',
      'ordered',
      'received',
      'completed',
      'cancelled',
    ])
    .optional()
    .default('draft'),
  discountPercent: z.number().min(0).max(100).optional().default(0),
  discountAmount: z.number().nonnegative().optional().default(0),
  taxPercent: z.number().min(0).max(100).optional().default(0),
  notes: z.string().optional().nullable(),
  items: z
    .array(purchaseOrderItemSchema)
    .min(1, 'purchases.orders.validation.itemsMin'),
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
    .enum([
      'draft',
      'pending_approval',
      'approved',
      'ordered',
      'received',
      'completed',
      'cancelled',
    ])
    .optional(),
  paymentStatus: z.enum(['unpaid', 'partial', 'paid']).optional(),
  supplierId: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

export const updatePurchaseOrderStatusSchema = z.object({
  status: z.enum([
    'draft',
    'pending_approval',
    'approved',
    'ordered',
    'received',
    'completed',
    'cancelled',
  ]),
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

export const autoReorderSchema = z.object({
  variantIds: z
    .array(z.string().min(1))
    .min(1, 'purchases.orders.validation.autoReorderVariantsRequired'),
});

export type AutoReorderValues = z.infer<typeof autoReorderSchema>;

export interface AutoReorderPreviewItem {
  supplierId: string;
  supplierName: string;
  supplierCode: string;
  items: {
    variantId: string;
    productName: string;
    variantName: string;
    sku: string;
    currentStock: number;
    minStock: number;
    orderQty: number;
    unitPrice: number;
  }[];
}

export interface AutoReorderPreviewResult {
  groups: AutoReorderPreviewItem[];
  noSupplierVariants: {
    variantId: string;
    productName: string;
    variantName: string;
    sku: string;
  }[];
}

export interface AutoReorderExecuteResult {
  createdOrders: number;
  skippedVariants: number;
}
