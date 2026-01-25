import { z } from 'zod';

const customerBaseSchema = z.object({
  code: z.string().optional(),
  name: z.string().min(1, 'Nama pelanggan wajib diisi'),
  phone: z.string().optional().nullable(),
  email: z
    .string()
    .email('Email tidak valid')
    .or(z.literal(''))
    .optional()
    .nullable(),
  address: z.string().optional().nullable(),
  taxId: z.string().optional().nullable(),
  creditLimit: z
    .number()
    .min(0, 'Credit limit tidak boleh negatif')
    .optional()
    .default(0),
  priceLevelId: z.string().optional().nullable(),
  isActive: z.boolean().optional().default(true),
});

export const createCustomerSchema = customerBaseSchema;

export const updateCustomerSchema = customerBaseSchema.partial();

export const queryCustomersSchema = z.object({
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

export type CreateCustomerValues = z.infer<typeof createCustomerSchema>;
export type UpdateCustomerValues = z.infer<typeof updateCustomerSchema>;
export type QueryCustomersValues = z.infer<typeof queryCustomersSchema>;
