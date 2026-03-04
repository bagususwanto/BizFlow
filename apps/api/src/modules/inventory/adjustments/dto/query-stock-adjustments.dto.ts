import { queryStockAdjustmentsSchema } from '@bizflow/types';
import { createZodDto } from 'nestjs-zod';

export class QueryStockAdjustmentsDto extends createZodDto(
  queryStockAdjustmentsSchema,
) {}
