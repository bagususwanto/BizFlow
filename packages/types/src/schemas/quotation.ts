import { z } from 'zod';

// ========================================
// Quotation Schemas
// ========================================

const quotationItemSchema = z.object({
  variantId: z.string().min(1, 'sales.quotations.validation.variantRequired'),
  quantity: z.number().positive('sales.quotations.validation.qtyPositive'),
  unitPrice: z.number().nonnegative('sales.quotations.validation.priceNonNeg'),
  discountPercent: z.number().min(0).max(100).optional().default(0),
  discountAmount: z.number().nonnegative().optional().default(0),
  notes: z
    .string()
    .max(500, { message: 'sales.quotations.validation.itemNotesMax' })
    .optional()
    .nullable(),
});

export type QuotationItemValues = z.infer<typeof quotationItemSchema>;

export const createQuotationSchema = z.object({
  quotationNumber: z.string().optional(),
  customerId: z.string().optional().nullable(),
  outletId: z.string().min(1, 'sales.quotations.validation.outletRequired'),
  quotationDate: z.string().optional(),
  validUntil: z.string().optional().nullable(),
  discountPercent: z.number().min(0).max(100).optional().default(0),
  discountAmount: z.number().nonnegative().optional().default(0),
  taxPercent: z.number().min(0).max(100).optional().default(0),
  notes: z
    .string()
    .max(1000, { message: 'sales.quotations.validation.notesMax' })
    .optional()
    .nullable(),
  terms: z
    .string()
    .max(2000, { message: 'sales.quotations.validation.termsMax' })
    .optional()
    .nullable(),
  items: z
    .array(quotationItemSchema)
    .min(1, 'sales.quotations.validation.itemsMin'),
});

export type CreateQuotationValues = z.infer<typeof createQuotationSchema>;

export const updateQuotationSchema = createQuotationSchema
  .omit({ outletId: true })
  .partial()
  .extend({
    items: z.array(quotationItemSchema).min(1).optional(),
  });

export type UpdateQuotationValues = z.infer<typeof updateQuotationSchema>;

export const updateQuotationStatusSchema = z.object({
  status: z.enum(['draft', 'sent', 'accepted', 'rejected', 'expired']),
  notes: z
    .string()
    .max(500, { message: 'sales.quotations.validation.statusNotesMax' })
    .optional()
    .nullable(),
});

export type UpdateQuotationStatusValues = z.infer<
  typeof updateQuotationStatusSchema
>;

export const queryQuotationsSchema = z.object({
  page: z.string().optional().transform(Number),
  pageSize: z.string().optional().transform(Number),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
  search: z.string().optional(),
  customerId: z.string().optional(),
  outletId: z.string().optional(),
  status: z
    .enum(['draft', 'sent', 'accepted', 'rejected', 'expired'])
    .optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

export type QueryQuotationsValues = z.infer<typeof queryQuotationsSchema>;

export const convertQuotationSchema = z.object({
  outletId: z.string().min(1, 'sales.quotations.validation.outletRequired'),
  orderDate: z.string().optional(),
  dueDate: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
});

export type ConvertQuotationValues = z.infer<typeof convertQuotationSchema>;
