import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email({
    message: 'Silakan masukkan email yang valid.',
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
