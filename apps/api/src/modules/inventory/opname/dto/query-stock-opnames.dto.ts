import { queryStockOpnamesSchema } from '@bizflow/types';
import { createZodDto } from 'nestjs-zod';

export class QueryStockOpnamesDto extends createZodDto(
  queryStockOpnamesSchema,
) {}
