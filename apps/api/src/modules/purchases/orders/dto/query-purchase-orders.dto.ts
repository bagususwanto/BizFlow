import { queryPurchaseOrdersSchema } from '@bizflow/types';
import { createZodDto } from 'nestjs-zod';

export class QueryPurchaseOrdersDto extends createZodDto(
  queryPurchaseOrdersSchema,
) {}
