import { z } from 'zod';

const supplierBaseSchema = z.object({
  code: z.string().optional(),
  name: z.string().min(1, 'Nama supplier wajib diisi'),
  phone: z.string().optional().nullable(),
  email: z
    .string()
    .email('Email tidak valid')
    .or(z.literal(''))
    .optional()
    .nullable(),
  address: z.string().optional().nullable(),
  taxId: z.string().optional().nullable(),
  paymentTermDays: z
    .number()
    .min(0, 'Payment term tidak boleh negatif')
    .optional()
    .default(0),
  bankName: z.string().optional().nullable(),
  bankAccount: z.string().optional().nullable(),
  isActive: z.boolean().optional().default(true),
});

export const createSupplierSchema = supplierBaseSchema;

export const updateSupplierSchema = supplierBaseSchema.partial();

export const querySuppliersSchema = z.object({
  page: z.string().optional().transform(Number),
  pageSize: z.string().optional().transform(Number),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
  search: z.string().optional(),
  isActive: z
    .string()
    .optional()
    .transform((val) => {
      if (val === 'true') return true;
      if (val === 'false') return false;
      return val;
    }),
});

export type CreateSupplierValues = z.infer<typeof createSupplierSchema>;
export type UpdateSupplierValues = z.infer<typeof updateSupplierSchema>;
export type QuerySuppliersValues = z.infer<typeof querySuppliersSchema>;
