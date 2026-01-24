import { updateCustomerSchema } from '@bizflow/types';
import { createZodDto } from 'nestjs-zod';

export class UpdateCustomerDto extends createZodDto(updateCustomerSchema) {}
