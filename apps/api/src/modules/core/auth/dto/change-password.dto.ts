import { createZodDto } from 'nestjs-zod';
import { changePasswordSchema } from '@bizflow/types';

export class ChangePasswordDto extends createZodDto(changePasswordSchema) {
  currentPassword!: string;
  newPassword!: string;
  confirmPassword!: string;
}
