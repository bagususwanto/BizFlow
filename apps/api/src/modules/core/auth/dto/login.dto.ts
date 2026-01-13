import { createZodDto } from 'nestjs-zod';
import { loginSchema } from '@bizflow/types';

export class LoginDto extends createZodDto(loginSchema) {}
