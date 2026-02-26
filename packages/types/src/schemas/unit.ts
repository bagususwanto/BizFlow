import { z } from 'zod';

const unitBaseSchema = z.object({
  name: z.string().min(1, 'units.validation.nameRequired'),
  symbol: z.string().min(1, 'units.validation.symbolRequired'),
  baseUnitId: z.string().optional(),
  conversionRate: z
    .number()
    .min(0.0001, 'units.validation.conversionRateMin')
    .optional(),
});

export const createUnitSchema = unitBaseSchema.refine(
  (data) => {
    if (data.baseUnitId && !data.conversionRate) {
      return false;
    }
    return true;
  },
  {
    message: 'units.validation.conversionRateRequired',
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
    message: 'units.validation.conversionRateRequired',
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
