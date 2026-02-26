import { z } from 'zod';

// ========================================
// Category Schemas
// ========================================

// ========================================
// Create Category Schema
// ========================================

export const createCategorySchema = z.object({
  name: z
    .string()
    .min(1, { message: 'categories.validation.nameRequired' })
    .max(100, { message: 'categories.validation.nameMax' }),
  parentId: z.preprocess(
    (val) => (val === '' ? null : val),
    z.string().nullable().optional(),
  ),
  description: z.preprocess(
    (val) => (val === '' ? undefined : val),
    z
      .string()
      .max(255, { message: 'categories.validation.descriptionMax' })
      .optional(),
  ),
  isActive: z.boolean().default(true),
});

export type CreateCategoryValues = z.infer<typeof createCategorySchema>;

// ========================================
// Update Category Schema
// ========================================

export const updateCategorySchema = z.object({
  name: z
    .string()
    .min(1, { message: 'categories.validation.nameRequired' })
    .max(100, { message: 'categories.validation.nameMax' })
    .optional(),
  parentId: z.preprocess(
    (val) => (val === '' ? null : val),
    z.string().nullable().optional(),
  ),
  description: z.preprocess(
    (val) => (val === '' ? undefined : val),
    z
      .string()
      .max(255, { message: 'categories.validation.descriptionMax' })
      .optional()
      .nullable(),
  ),
  isActive: z.boolean().optional(),
});

export type UpdateCategoryValues = z.infer<typeof updateCategorySchema>;

// ========================================
// Query Categories Schema
// ========================================

export const queryCategoriesSchema = z.object({
  // Pagination
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(10),

  // Sorting
  sortBy: z
    .enum(['name', 'createdAt', 'updatedAt', 'productCount'])
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
  parentId: z.preprocess(
    (val) => (val === '' || val === 'null' ? null : val),
    z.string().nullable().optional(),
  ),
});

export type QueryCategoriesValues = z.infer<typeof queryCategoriesSchema>;
