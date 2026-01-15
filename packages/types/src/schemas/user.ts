import { z } from 'zod';

// ========================================
// User Schemas
// ========================================

// Password validation: min 8 chars, 1 uppercase, 1 number
const passwordSchema = z
  .string()
  .min(8, { message: 'Password minimal 8 karakter' })
  .regex(/[A-Z]/, {
    message: 'Password harus mengandung minimal 1 huruf besar',
  })
  .regex(/[0-9]/, { message: 'Password harus mengandung minimal 1 angka' });

// PIN validation: 4-6 digits
const pinSchema = z
  .string()
  .min(4, { message: 'PIN minimal 4 digit' })
  .max(6, { message: 'PIN maksimal 6 digit' })
  .regex(/^\d+$/, { message: 'PIN hanya boleh berisi angka' });

// Username validation
const usernameSchema = z
  .string()
  .min(4, { message: 'Username minimal 4 karakter' })
  .max(50, { message: 'Username maksimal 50 karakter' })
  .regex(/^[a-z0-9_]+$/, {
    message: 'Username hanya boleh huruf kecil, angka, dan underscore',
  });

// Email validation
const emailSchema = z
  .string()
  .email({ message: 'Format email tidak valid' })
  .max(100, { message: 'Email maksimal 100 karakter' });

// ========================================
// Create User Schema
// ========================================

export const createUserSchema = z.object({
  username: usernameSchema,
  email: z.preprocess(
    (val) => (val === '' ? undefined : val),
    emailSchema.optional(),
  ),
  password: passwordSchema,
  pin: z.preprocess(
    (val) => (val === '' ? undefined : val),
    pinSchema.optional(),
  ),
  name: z
    .string()
    .min(1, { message: 'Nama wajib diisi' })
    .max(100, { message: 'Nama maksimal 100 karakter' }),
  phoneNumber: z.preprocess(
    (val) => (val === '' ? undefined : val),
    z
      .string()
      .max(20, { message: 'No. Telepon maksimal 20 karakter' })
      .optional(),
  ),
  roleId: z.string().min(1, { message: 'Role wajib dipilih' }),
  outletIds: z.array(z.string()).optional(),
  isActive: z.boolean().default(true),
});

export type CreateUserValues = z.infer<typeof createUserSchema>;

// ========================================
// Update User Schema
// ========================================

export const updateUserSchema = z.object({
  email: z.preprocess(
    (val) => (val === '' ? undefined : val),
    emailSchema.optional().nullable(),
  ),
  name: z
    .string()
    .min(1, { message: 'Nama wajib diisi' })
    .max(100, { message: 'Nama maksimal 100 karakter' })
    .optional(),
  phoneNumber: z.preprocess(
    (val) => (val === '' ? undefined : val),
    z
      .string()
      .max(20, { message: 'No. Telepon maksimal 20 karakter' })
      .optional()
      .nullable(),
  ),
  roleId: z.string().min(1, { message: 'Role wajib dipilih' }).optional(),
  outletIds: z.array(z.string()).optional(),
  isActive: z.boolean().optional(),
});

export type UpdateUserValues = z.infer<typeof updateUserSchema>;

// ========================================
// Change Password Schema (Admin Reset)
// ========================================

export const adminResetPasswordSchema = z.object({
  newPassword: passwordSchema,
});

export type AdminResetPasswordValues = z.infer<typeof adminResetPasswordSchema>;

// ========================================
// Change Password Schema (Self)
// ========================================

export const changePasswordSchema = z
  .object({
    currentPassword: z
      .string()
      .min(1, { message: 'Password lama wajib diisi' }),
    newPassword: passwordSchema,
    confirmPassword: z
      .string()
      .min(1, { message: 'Konfirmasi password wajib diisi' }),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Konfirmasi password tidak cocok',
    path: ['confirmPassword'],
  });

export type ChangePasswordValues = z.infer<typeof changePasswordSchema>;

// ========================================
// Change PIN Schema
// ========================================

export const changePinSchema = z.object({
  currentPin: z.string().optional(),
  newPin: pinSchema,
});

export type ChangePinValues = z.infer<typeof changePinSchema>;

// ========================================
// Query Users Schema
// ========================================

export const queryUsersSchema = z.object({
  // Pagination
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(10),

  // Sorting
  sortBy: z
    .enum(['username', 'name', 'email', 'createdAt', 'updatedAt', 'lastLogin'])
    .default('name'),
  sortOrder: z.enum(['asc', 'desc']).default('asc'),

  // Filters
  search: z.string().optional(),
  roleId: z.string().optional(),
  isActive: z.coerce.boolean().optional(),
});

export type QueryUsersValues = z.infer<typeof queryUsersSchema>;

// Alias for frontend usage
export type UsersQuery = QueryUsersValues;
