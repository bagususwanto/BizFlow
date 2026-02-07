import { createZodDto } from 'nestjs-zod';
import { resetPasswordSchema } from '@bizflow/types';

export class ResetPasswordDto extends createZodDto(resetPasswordSchema) {
  token!: string;
  password!: string;
  confirmPassword!: string;
}
