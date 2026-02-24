import { createZodDto } from 'nestjs-zod';
import { changePasswordSchema } from '@bizflow/types';

export class ChangePasswordDto extends createZodDto(changePasswordSchema) {
  declare currentPassword: string;
  declare newPassword: string;
  declare confirmPassword: string;
}
