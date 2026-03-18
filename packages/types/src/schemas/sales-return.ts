import { z } from 'zod';

// ========================================
// Sales Return Schemas
// ========================================

const salesReturnItemSchema = z.object({
  orderItemId: z
    .string()
    .min(1, 'sales.returns.validation.orderItemRequired'),
  quantity: z.number().positive('sales.returns.validation.qtyPositive'),
  reason: z
    .string()
    .max(500, { message: 'sales.returns.validation.itemReasonMax' })
    .optional()
    .nullable(),
});

export type SalesReturnItemValues = z.infer<typeof salesReturnItemSchema>;

export const createSalesReturnSchema = z.object({
  returnNumber: z.string().optional(),
  orderId: z.string().min(1, 'sales.returns.validation.orderRequired'),
  reason: z.string().min(1, 'sales.returns.validation.reasonRequired'),
  refundMethod: z
    .enum(['cash', 'credit', 'transfer', 'exchange'])
    .optional()
    .nullable(),
  notes: z
    .string()
    .max(1000, { message: 'sales.returns.validation.notesMax' })
    .optional()
    .nullable(),
  items: z
    .array(salesReturnItemSchema)
    .min(1, 'sales.returns.validation.itemsMin'),
});

export type CreateSalesReturnValues = z.infer<typeof createSalesReturnSchema>;

export const updateSalesReturnSchema = createSalesReturnSchema
  .omit({ orderId: true })
  .partial()
  .extend({
    items: z.array(salesReturnItemSchema).min(1).optional(),
  });

export type UpdateSalesReturnValues = z.infer<typeof updateSalesReturnSchema>;

export const updateSalesReturnStatusSchema = z.object({
  status: z.enum(['pending', 'approved', 'rejected']),
  notes: z
    .string()
    .max(500, { message: 'sales.returns.validation.statusNotesMax' })
    .optional()
    .nullable(),
});

export type UpdateSalesReturnStatusValues = z.infer<
  typeof updateSalesReturnStatusSchema
>;

export const querySalesReturnsSchema = z.object({
  page: z.string().optional().transform(Number),
  pageSize: z.string().optional().transform(Number),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
  search: z.string().optional(),
  orderId: z.string().optional(),
  customerId: z.string().optional(),
  status: z.enum(['pending', 'approved', 'rejected']).optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

export type QuerySalesReturnsValues = z.infer<typeof querySalesReturnsSchema>;
