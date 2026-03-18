import { z } from 'zod';

// ========================================
// Customer Payment Schemas
// ========================================

export const createCustomerPaymentSchema = z.object({
  paymentNumber: z.string().optional(),
  customerId: z.string().optional().nullable(),
  invoiceId: z.string().optional().nullable(),
  orderId: z.string().optional().nullable(),
  accountId: z
    .string()
    .min(1, 'sales.payments.validation.accountRequired'),
  paymentDate: z
    .string()
    .min(1, 'sales.payments.validation.dateRequired'),
  amount: z
    .number()
    .positive({ message: 'sales.payments.validation.amountPositive' }),
  paymentMethod: z.enum(['cash', 'qris', 'transfer', 'credit', 'debit'], {
    message: 'sales.payments.validation.methodInvalid',
  }),
  reference: z
    .string()
    .max(255, { message: 'sales.payments.validation.referenceMax' })
    .optional()
    .nullable(),
  notes: z
    .string()
    .max(1000, { message: 'sales.payments.validation.notesMax' })
    .optional()
    .nullable(),
});

export type CreateCustomerPaymentValues = z.infer<
  typeof createCustomerPaymentSchema
>;

export const updateCustomerPaymentSchema = createCustomerPaymentSchema
  .omit({ customerId: true })
  .partial();

export type UpdateCustomerPaymentValues = z.infer<
  typeof updateCustomerPaymentSchema
>;

export const queryCustomerPaymentsSchema = z.object({
  page: z.string().optional().transform(Number),
  pageSize: z.string().optional().transform(Number),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
  search: z.string().optional(),
  customerId: z.string().optional(),
  invoiceId: z.string().optional(),
  orderId: z.string().optional(),
  accountId: z.string().optional(),
  paymentMethod: z
    .enum(['cash', 'qris', 'transfer', 'credit', 'debit'])
    .optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

export type QueryCustomerPaymentsValues = z.infer<
  typeof queryCustomerPaymentsSchema
>;
