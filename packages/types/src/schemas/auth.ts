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
