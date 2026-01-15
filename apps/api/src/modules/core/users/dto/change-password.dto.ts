import { createZodDto } from 'nestjs-zod';
import { adminResetPasswordSchema, changePasswordSchema } from '@bizflow/types';

export class AdminResetPasswordDto extends createZodDto(
  adminResetPasswordSchema,
) {}

export class ChangePasswordDto extends createZodDto(changePasswordSchema) {}
