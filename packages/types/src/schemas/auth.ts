import { z } from 'zod';

export const loginSchema = z.object({
  username: z.string().min(1, {
    message: 'Username wajib diisi.',
  }),
  password: z.string().min(6, {
    message: 'Password minimal 6 karakter.',
  }),
});

export type LoginValues = z.infer<typeof loginSchema>;

export const pinLoginSchema = z.object({
  userId: z.string().min(1, { message: 'User ID wajib diisi' }),
  pin: z
    .string()
    .min(1, { message: 'PIN wajib diisi' })
    .min(4, { message: 'PIN harus 4-6 digit' })
    .max(6, { message: 'PIN harus 4-6 digit' }),
});

export type PinLoginValues = z.infer<typeof pinLoginSchema>;

export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, { message: 'Refresh token wajib diisi' }),
});

export type RefreshTokenValues = z.infer<typeof refreshTokenSchema>;

// Password Reset Schemas
export const forgotPasswordSchema = z.object({
  email: z.string().email('Format email tidak valid'),
});

export type ForgotPasswordValues = z.infer<typeof forgotPasswordSchema>;

export const verifyResetTokenSchema = z.object({
  token: z.string().min(1, 'Token diperlukan'),
});

export type VerifyResetTokenValues = z.infer<typeof verifyResetTokenSchema>;

export const resetPasswordSchema = z
  .object({
    token: z.string().min(1, 'Token diperlukan'),
    password: z
      .string()
      .min(8, 'Password minimal 8 karakter')
      .regex(/[A-Z]/, 'Password harus mengandung minimal 1 huruf besar')
      .regex(/[0-9]/, 'Password harus mengandung minimal 1 angka'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Konfirmasi password tidak cocok',
    path: ['confirmPassword'],
  });

export type ResetPasswordValues = z.infer<typeof resetPasswordSchema>;
