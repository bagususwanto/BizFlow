import { createZodDto } from 'nestjs-zod';
import { loginSchema } from '@bizflow/types/schemas';

export class LoginDto extends createZodDto(loginSchema) {}
