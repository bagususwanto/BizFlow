import { z } from 'zod';

const paymentTermBaseSchema = z.object({
  name: z.string().min(1, 'paymentTerms.validation.nameRequired'),
  daysDue: z
    .number()
    .min(0, 'paymentTerms.validation.daysDueMin')
    .optional()
    .default(0),
  description: z.string().optional().nullable(),
  isActive: z.boolean().optional().default(true),
});

export const createPaymentTermSchema = paymentTermBaseSchema;

export const updatePaymentTermSchema = paymentTermBaseSchema.partial();

export const queryPaymentTermsSchema = z.object({
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

export type CreatePaymentTermValues = z.infer<typeof createPaymentTermSchema>;
export type UpdatePaymentTermValues = z.infer<typeof updatePaymentTermSchema>;
export type QueryPaymentTermsValues = z.infer<typeof queryPaymentTermsSchema>;
