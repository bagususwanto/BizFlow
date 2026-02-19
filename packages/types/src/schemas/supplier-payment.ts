import { z } from 'zod';

// ========================================
// Supplier Payment Schemas
// ========================================

export const createSupplierPaymentSchema = z.object({
  paymentNumber: z.string().optional(),
  supplierId: z.string().min(1, 'Supplier wajib dipilih'),
  purchaseOrderId: z.string().optional().nullable(),
  accountId: z.string().min(1, 'Akun pembayaran wajib dipilih'),
  paymentDate: z.string().min(1, 'Tanggal pembayaran wajib diisi'),
  amount: z
    .number()
    .positive({ message: 'Jumlah pembayaran harus lebih dari 0' }),
  paymentMethod: z.enum(['cash', 'qris', 'transfer', 'credit', 'debit'], {
    message: 'Metode pembayaran tidak valid',
  }),
  reference: z
    .string()
    .max(255, { message: 'Referensi maksimal 255 karakter' })
    .optional()
    .nullable(),
  notes: z
    .string()
    .max(1000, { message: 'Catatan maksimal 1000 karakter' })
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
