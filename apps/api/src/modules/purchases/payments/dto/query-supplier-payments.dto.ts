import { querySupplierPaymentsSchema } from '@bizflow/types';
import { createZodDto } from 'nestjs-zod';

export class QuerySupplierPaymentsDto extends createZodDto(
  querySupplierPaymentsSchema,
) {}
