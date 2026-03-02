import { z } from 'zod';

// ========================================
// Outlet Schemas
// ========================================

const outletCodeSchema = z
  .string()
  .max(20, { message: 'outlets.validation.codeMax' })
  .regex(/^[A-Z0-9_]*$/, {
    message: 'outlets.validation.codeMax', // Re-using, need a better key if strict but this works for now, or omit
  });

// ========================================
// Create Outlet Schema
// ========================================

export const createOutletSchema = z.object({
  code: outletCodeSchema.optional().or(z.literal('')),
  name: z
    .string()
    .min(1, { message: 'outlets.validation.nameRequired' })
    .max(100, { message: 'outlets.validation.nameMax' }),
  address: z.preprocess(
    (val) => (val === '' ? undefined : val),
    z
      .string()
      .max(255, { message: 'outlets.validation.addressMax' })
      .optional(),
  ),
  phone: z.preprocess(
    (val) => (val === '' ? undefined : val),
    z.string().max(20, { message: 'outlets.validation.phoneMax' }).optional(),
  ),
  isActive: z.boolean().default(true),
});

export type CreateOutletValues = z.infer<typeof createOutletSchema>;

// ========================================
// Update Outlet Schema
// ========================================

export const updateOutletSchema = z.object({
  code: outletCodeSchema.optional(),
  name: z
    .string()
    .min(1, { message: 'outlets.validation.nameRequired' })
    .max(100, { message: 'outlets.validation.nameMax' })
    .optional(),
  address: z.preprocess(
    (val) => (val === '' ? undefined : val),
    z
      .string()
      .max(255, { message: 'outlets.validation.addressMax' })
      .optional()
      .nullable(),
  ),
  phone: z.preprocess(
    (val) => (val === '' ? undefined : val),
    z
      .string()
      .max(20, { message: 'outlets.validation.phoneMax' })
      .optional()
      .nullable(),
  ),
  isActive: z.boolean().optional(),
});

export type UpdateOutletValues = z.infer<typeof updateOutletSchema>;

// ========================================
// Query Outlets Schema
// ========================================

export const queryOutletsSchema = z.object({
  // Pagination
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(10),

  // Sorting
  sortBy: z
    .enum(['code', 'name', 'createdAt', 'updatedAt', 'userCount'])
    .default('name'),
  sortOrder: z.enum(['asc', 'desc']).default('asc'),

  // Filters
  search: z.string().optional(),
  isActive: z.preprocess((val) => {
    if (typeof val === 'string') {
      if (val === 'true') return true;
      if (val === 'false') return false;
    }
    return val;
  }, z.boolean().optional()),
});

export type QueryOutletsValues = z.infer<typeof queryOutletsSchema>;
