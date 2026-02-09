import { queryStockSchema } from '@bizflow/types';
import { createZodDto } from 'nestjs-zod';

export class QueryStockDto extends createZodDto(queryStockSchema) {}
