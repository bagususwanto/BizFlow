import { queryStockLotsSchema } from '@bizflow/types';
import { createZodDto } from 'nestjs-zod';

export class QueryStockLotsDto extends createZodDto(queryStockLotsSchema) {}
