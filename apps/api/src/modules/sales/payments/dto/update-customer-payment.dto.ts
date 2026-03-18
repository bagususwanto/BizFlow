import { updateCustomerPaymentSchema } from '@bizflow/types';
import { createZodDto } from 'nestjs-zod';

export class UpdateCustomerPaymentDto extends createZodDto(
  updateCustomerPaymentSchema,
) {}
