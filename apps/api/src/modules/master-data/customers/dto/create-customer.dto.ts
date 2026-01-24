import { createCustomerSchema } from '@bizflow/types';
import { createZodDto } from 'nestjs-zod';

export class CreateCustomerDto extends createZodDto(createCustomerSchema) {}
