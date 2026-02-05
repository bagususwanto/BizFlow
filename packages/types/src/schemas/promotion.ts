import { z } from 'zod';

// ========================================
// Promotion Schemas
// ========================================

export const createPromotionSchema = z.object({
  code: z.preprocess(
    (val) => (val === '' ? undefined : val),
    z.string().optional(),
  ),
  name: z
    .string()
    .min(1, { message: 'Nama promo wajib diisi' })
    .max(100, { message: 'Nama promo maksimal 100 karakter' }),
  description: z.preprocess(
    (val) => (val === '' ? undefined : val),
    z.string().optional(),
  ),
  type: z.enum(['percentage', 'fixed', 'buy_x_get_y'], {
    message: 'Tipe promo tidak valid',
  }),
  value: z.coerce.number().min(0).optional(),
  minPurchase: z.coerce.number().min(0).optional(),
  maxDiscount: z.coerce.number().min(0).optional(),
  applyTo: z.enum(['all', 'category', 'product'], {
    message: 'Target promo tidak valid',
  }),
  targetIds: z.array(z.string()).optional(),
  startDate: z.coerce.date(),
  endDate: z.coerce.date(),
  isActive: z.boolean().default(true),
});

export type CreatePromotionValues = z.infer<typeof createPromotionSchema>;

export const updatePromotionSchema = createPromotionSchema.partial();

export type UpdatePromotionValues = z.infer<typeof updatePromotionSchema>;

export const queryPromotionsSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(10),
  sortBy: z
    .enum(['name', 'startDate', 'endDate', 'createdAt'])
    .default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
  search: z.string().optional(),
  isActive: z.preprocess((val) => {
    if (typeof val === 'string') {
      if (val === 'true') return true;
      if (val === 'false') return false;
    }
    return val;
  }, z.boolean().optional()),
  type: z.enum(['percentage', 'fixed', 'buy_x_get_y']).optional(),
});

export type QueryPromotionsValues = z.infer<typeof queryPromotionsSchema>;
