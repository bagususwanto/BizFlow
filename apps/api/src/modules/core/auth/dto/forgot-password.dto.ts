import { createZodDto } from 'nestjs-zod';
import { forgotPasswordSchema } from '@bizflow/types';

export class ForgotPasswordDto extends createZodDto(forgotPasswordSchema) {}
