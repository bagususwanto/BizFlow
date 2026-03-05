import { queryStockTransfersSchema } from '@bizflow/types';
import { createZodDto } from 'nestjs-zod';

export class QueryStockTransfersDto extends createZodDto(
  queryStockTransfersSchema,
) {}
