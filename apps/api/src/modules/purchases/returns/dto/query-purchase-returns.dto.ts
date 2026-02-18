import { queryPurchaseReturnsSchema } from '@bizflow/types';
import { createZodDto } from 'nestjs-zod';

export class QueryPurchaseReturnsDto extends createZodDto(
  queryPurchaseReturnsSchema,
) {}
