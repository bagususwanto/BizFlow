import { z } from 'zod';

const invoiceItemSchema = z.object({
  orderItemId: z.string().min(1, 'sales.invoices.validation.orderItemRequired'),
  variantId: z.string().min(1, 'sales.invoices.validation.variantRequired'),
  quantity: z.number().positive('sales.invoices.validation.quantityMin'),
  unitPrice: z.number().nonnegative('sales.invoices.validation.priceMin'),
  discountAmount: z.number().nonnegative().optional().default(0),
  notes: z.string().optional().nullable(),
});

const invoiceBaseSchema = z.object({
  invoiceNumber: z.string().optional(),
  orderId: z.string().min(1, 'sales.invoices.validation.orderRequired'),
  invoiceDate: z.string().datetime().or(z.date()).optional().nullable(),
  dueDate: z.string().datetime().or(z.date()).optional().nullable(),
  notes: z.string().optional().nullable(),
  items: z
    .array(invoiceItemSchema)
    .min(1, 'sales.invoices.validation.itemsMin'),
});

export const createInvoiceSchema = invoiceBaseSchema;

export const updateInvoiceSchema = invoiceBaseSchema
  .partial()
  .extend({
    items: z.array(invoiceItemSchema).min(1).optional(),
  });

export const queryInvoicesSchema = z.object({
  page: z.string().optional().transform(Number),
  pageSize: z.string().optional().transform(Number),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
  search: z.string().optional(),
  status: z
    .enum(['draft', 'sent', 'partial', 'paid', 'cancelled'])
    .optional(),
  paymentStatus: z.enum(['unpaid', 'partial', 'paid']).optional(),
  orderId: z.string().optional(),
  customerId: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

export const updateInvoiceStatusSchema = z.object({
  status: z.enum(['draft', 'sent', 'partial', 'paid', 'cancelled']),
});

export type CreateInvoiceValues = z.infer<typeof createInvoiceSchema>;
export type UpdateInvoiceValues = z.infer<typeof updateInvoiceSchema>;
export type QueryInvoicesValues = z.infer<typeof queryInvoicesSchema>;
export type UpdateInvoiceStatusValues = z.infer<
  typeof updateInvoiceStatusSchema
>;
