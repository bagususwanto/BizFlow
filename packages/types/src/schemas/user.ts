import { z } from 'zod';

// ========================================
// User Schemas
// ========================================

// Password validation: min 8 chars, 1 uppercase, 1 number
const passwordSchema = z
  .string()
  .min(8, { message: 'profile.validation.passwordMin' })
  .regex(/[A-Z]/, {
    message: 'profile.validation.passwordUppercase',
  })
  .regex(/[0-9]/, { message: 'profile.validation.passwordNumber' });

// PIN validation: 4-6 digits
const pinSchema = z
  .string()
  .min(4, { message: 'profile.validation.pinMin' })
  .max(6, { message: 'profile.validation.pinMax' })
  .regex(/^\d+$/, { message: 'profile.validation.pinNumber' });

// Username validation
const usernameSchema = z
  .string()
  .min(4, { message: 'profile.validation.usernameMin' })
  .max(50, { message: 'profile.validation.usernameMax' })
  .regex(/^[a-z0-9_]+$/, {
    message: 'profile.validation.usernameFormat',
  });

// Email validation
const emailSchema = z
  .string()
  .email({ message: 'profile.validation.emailInvalid' })
  .max(100, { message: 'profile.validation.emailMax' });

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
    .min(1, { message: 'users.validation.nameRequired' })
    .max(100, { message: 'users.validation.nameMax' }),
  phoneNumber: z.preprocess(
    (val) => (val === '' ? undefined : val),
    z.string().max(20, { message: 'users.validation.phoneMax' }).optional(),
  ),
  roleId: z.string().min(1, { message: 'users.validation.roleRequired' }),
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
    .min(1, { message: 'users.validation.nameRequired' })
    .max(100, { message: 'users.validation.nameMax' })
    .optional(),
  phoneNumber: z.preprocess(
    (val) => (val === '' ? undefined : val),
    z
      .string()
      .max(20, { message: 'users.validation.phoneMax' })
      .optional()
      .nullable(),
  ),
  roleId: z
    .string()
    .min(1, { message: 'users.validation.roleRequired' })
    .optional(),
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
      .min(1, { message: 'profile.validation.currentPasswordRequired' }),
    newPassword: passwordSchema,
    confirmPassword: z
      .string()
      .min(1, { message: 'profile.validation.confirmPasswordRequired' }),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'profile.validation.confirmPasswordMismatch',
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
    .enum([
      'username',
      'name',
      'email',
      'createdAt',
      'updatedAt',
      'lastLogin',
      'role.name',
      'status',
    ])
    .default('name'),
  sortOrder: z.enum(['asc', 'desc']).default('asc'),

  // Filters
  search: z.string().optional(),
  roleId: z.string().optional(),
  isActive: z.preprocess((val) => {
    if (typeof val === 'string') {
      if (val === 'true') return true;
      if (val === 'false') return false;
    }
    return val;
  }, z.boolean().optional()),
});

export type QueryUsersValues = z.infer<typeof queryUsersSchema>;

// Alias for frontend usage
export type UsersQuery = QueryUsersValues;
