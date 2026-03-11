import { queryStockValuationSchema } from '@bizflow/types';
import { createZodDto } from 'nestjs-zod';

export class QueryStockValuationDto extends createZodDto(
  queryStockValuationSchema,
) {}
