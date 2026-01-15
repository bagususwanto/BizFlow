import { createZodDto } from 'nestjs-zod';
import { createUserSchema, updateUserSchema } from '@bizflow/types';

export class CreateUserDto extends createZodDto(createUserSchema) {}

export class UpdateUserDto extends createZodDto(updateUserSchema) {}
