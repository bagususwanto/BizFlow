import { z } from 'zod';

const salesOrderItemSchema = z.object({
  variantId: z.string().min(1, 'sales.orders.validation.variantRequired'),
  quantity: z.number().positive('sales.orders.validation.quantityMin'),
  unitPrice: z.number().nonnegative('sales.orders.validation.priceMin'),
  discountPercent: z.number().min(0).max(100).optional().default(0),
  discountAmount: z.number().nonnegative().optional().default(0),
  notes: z.string().optional().nullable(),
});

const salesOrderBaseSchema = z.object({
  orderNumber: z.string().optional(),
  customerId: z.string().optional().nullable(),
  outletId: z.string().min(1, 'sales.orders.validation.outletRequired'),
  orderDate: z.string().datetime().or(z.date()).optional().nullable(),
  dueDate: z.string().datetime().or(z.date()).optional().nullable(),
  status: z
    .enum(['draft', 'confirmed', 'invoiced', 'completed', 'cancelled'])
    .optional()
    .default('draft'),
  discountPercent: z.number().min(0).max(100).optional().default(0),
  discountAmount: z.number().nonnegative().optional().default(0),
  taxPercent: z.number().min(0).max(100).optional().default(0),
  notes: z.string().optional().nullable(),
  items: z
    .array(salesOrderItemSchema)
    .min(1, 'sales.orders.validation.itemsMin'),
});

export const createSalesOrderSchema = salesOrderBaseSchema;

export const updateSalesOrderSchema = salesOrderBaseSchema
  .omit({ status: true })
  .partial()
  .extend({
    items: z.array(salesOrderItemSchema).min(1).optional(),
  });

export const querySalesOrdersSchema = z.object({
  page: z.string().optional().transform(Number),
  pageSize: z.string().optional().transform(Number),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
  search: z.string().optional(),
  status: z
    .enum(['draft', 'confirmed', 'invoiced', 'completed', 'cancelled'])
    .optional(),
  paymentStatus: z.enum(['unpaid', 'partial', 'paid']).optional(),
  customerId: z.string().optional(),
  outletId: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

export const updateSalesOrderStatusSchema = z.object({
  status: z.enum([
    'draft',
    'confirmed',
    'invoiced',
    'completed',
    'cancelled',
  ]),
});

export type CreateSalesOrderValues = z.infer<typeof createSalesOrderSchema>;
export type UpdateSalesOrderValues = z.infer<typeof updateSalesOrderSchema>;
export type QuerySalesOrdersValues = z.infer<typeof querySalesOrdersSchema>;
export type UpdateSalesOrderStatusValues = z.infer<
  typeof updateSalesOrderStatusSchema
>;
