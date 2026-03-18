import { createCustomerPaymentSchema } from '@bizflow/types';
import { createZodDto } from 'nestjs-zod';

export class CreateCustomerPaymentDto extends createZodDto(
  createCustomerPaymentSchema,
) {}
