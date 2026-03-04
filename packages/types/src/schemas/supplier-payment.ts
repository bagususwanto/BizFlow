import { z } from 'zod';

// ========================================
// Supplier Payment Schemas
// ========================================

export const createSupplierPaymentSchema = z.object({
  paymentNumber: z.string().optional(),
  supplierId: z
    .string()
    .min(1, 'purchases.payments.validation.supplierRequired'),
  purchaseOrderId: z.string().optional().nullable(),
  accountId: z.string().min(1, 'purchases.payments.validation.accountRequired'),
  paymentDate: z.string().min(1, 'purchases.payments.validation.dateRequired'),
  amount: z
    .number()
    .positive({ message: 'purchases.payments.validation.amountPositive' }),
  paymentMethod: z.enum(['cash', 'qris', 'transfer', 'credit', 'debit'], {
    message: 'purchases.payments.validation.methodInvalid',
  }),
  reference: z
    .string()
    .max(255, { message: 'purchases.payments.validation.referenceMax' })
    .optional()
    .nullable(),
  notes: z
    .string()
    .max(1000, { message: 'purchases.payments.validation.notesMax' })
    .optional()
    .nullable(),
});

export type CreateSupplierPaymentValues = z.infer<
  typeof createSupplierPaymentSchema
>;

export const updateSupplierPaymentSchema = createSupplierPaymentSchema
  .omit({ supplierId: true })
  .partial();

export type UpdateSupplierPaymentValues = z.infer<
  typeof updateSupplierPaymentSchema
>;

export const querySupplierPaymentsSchema = z.object({
  page: z.string().optional().transform(Number),
  pageSize: z.string().optional().transform(Number),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
  search: z.string().optional(),
  supplierId: z.string().optional(),
  purchaseOrderId: z.string().optional(),
  accountId: z.string().optional(),
  paymentMethod: z
    .enum(['cash', 'qris', 'transfer', 'credit', 'debit'])
    .optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

export type QuerySupplierPaymentsValues = z.infer<
  typeof querySupplierPaymentsSchema
>;
