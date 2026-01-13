import { z } from 'zod';

// Re-export from enums for convenience
export {
  AVAILABLE_MODULES,
  AVAILABLE_ACTIONS,
  SYSTEM_ROLES,
  Module,
  PermissionAction,
  UserRole,
  type SystemRole,
} from '../enums';

// ========================================
// Role Schemas
// ========================================

export const permissionItemSchema = z.object({
  module: z.string().min(1, { message: 'Module wajib diisi' }),
  action: z.string().min(1, { message: 'Action wajib diisi' }),
});

export type PermissionItem = z.infer<typeof permissionItemSchema>;

export const createRoleSchema = z.object({
  name: z
    .string()
    .min(1, { message: 'Nama role wajib diisi' })
    .max(50, { message: 'Nama role maksimal 50 karakter' })
    .regex(/^[a-z_]+$/, {
      message: 'Nama role hanya boleh huruf kecil dan underscore',
    }),
  description: z
    .string()
    .max(255, { message: 'Deskripsi maksimal 255 karakter' })
    .optional(),
  permissions: z.array(permissionItemSchema).optional(),
});

export type CreateRoleValues = z.infer<typeof createRoleSchema>;

export const updateRoleSchema = z.object({
  name: z
    .string()
    .min(1, { message: 'Nama role wajib diisi' })
    .max(50, { message: 'Nama role maksimal 50 karakter' })
    .regex(/^[a-z_]+$/, {
      message: 'Nama role hanya boleh huruf kecil dan underscore',
    })
    .optional(),
  description: z
    .string()
    .max(255, { message: 'Deskripsi maksimal 255 karakter' })
    .optional(),
  permissions: z.array(permissionItemSchema).optional(),
});

export type UpdateRoleValues = z.infer<typeof updateRoleSchema>;

export const queryRolesSchema = z.object({
  // Pagination
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(10),

  // Sorting
  sortBy: z
    .enum(['name', 'description', 'createdAt', 'updatedAt', 'userCount'])
    .default('name'),
  sortOrder: z.enum(['asc', 'desc']).default('asc'),

  // Filters
  search: z.string().optional(),
  isSystemRole: z.coerce.boolean().optional(),
});

export type QueryRolesValues = z.infer<typeof queryRolesSchema>;
