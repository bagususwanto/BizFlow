import { queryCustomerPaymentsSchema } from '@bizflow/types';
import { createZodDto } from 'nestjs-zod';

export class QueryCustomerPaymentsDto extends createZodDto(
  queryCustomerPaymentsSchema,
) {}
