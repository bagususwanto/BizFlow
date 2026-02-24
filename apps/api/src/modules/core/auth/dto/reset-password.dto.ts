import { createZodDto } from 'nestjs-zod';
import { resetPasswordSchema } from '@bizflow/types';

export class ResetPasswordDto extends createZodDto(resetPasswordSchema) {
  declare token: string;
  declare password: string;
  declare confirmPassword: string;
}
