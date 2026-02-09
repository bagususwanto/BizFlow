import { queryStockMovementSchema, queryStockCardSchema } from '@bizflow/types';
import { createZodDto } from 'nestjs-zod';

export class QueryStockMovementDto extends createZodDto(
  queryStockMovementSchema,
) {}

export class QueryStockCardDto extends createZodDto(queryStockCardSchema) {}
