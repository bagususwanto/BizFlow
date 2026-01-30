import { z } from 'zod';

const warehouseBaseSchema = z.object({
  code: z.string().optional(),
  name: z.string().min(1, 'Nama gudang wajib diisi'),
  address: z.string().optional().nullable(),
  isDefault: z.boolean().optional().default(false),
  isActive: z.boolean().optional().default(true),
});

export const createWarehouseSchema = warehouseBaseSchema;

export const updateWarehouseSchema = warehouseBaseSchema.partial();

export const queryWarehousesSchema = z.object({
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

export type CreateWarehouseValues = z.infer<typeof createWarehouseSchema>;
export type UpdateWarehouseValues = z.infer<typeof updateWarehouseSchema>;
export type QueryWarehousesValues = z.infer<typeof queryWarehousesSchema>;
