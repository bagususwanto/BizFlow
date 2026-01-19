import { z } from 'zod';

const unitBaseSchema = z.object({
  name: z.string().min(1, 'Nama satuan wajib diisi'),
  symbol: z.string().min(1, 'Simbol satuan wajib diisi'),
  baseUnitId: z.string().optional(),
  conversionRate: z.number().min(0.0001, 'Min 0.0001').optional(),
});

export const createUnitSchema = unitBaseSchema.refine(
  (data) => {
    if (data.baseUnitId && !data.conversionRate) {
      return false;
    }
    return true;
  },
  {
    message: 'Conversion rate wajib diisi jika memilih base unit',
    path: ['conversionRate'],
  },
);

export const updateUnitSchema = unitBaseSchema.partial().refine(
  (data) => {
    if (data.baseUnitId && !data.conversionRate) {
      return false;
    }
    return true;
  },
  {
    message: 'Conversion rate wajib diisi jika memilih base unit',
    path: ['conversionRate'],
  },
);

export const queryUnitsSchema = z.object({
  page: z.string().optional().transform(Number),
  pageSize: z.string().optional().transform(Number),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
  search: z.string().optional(),
  baseUnitId: z.string().optional(),
});
