import { queryStockReportSchema } from '@bizflow/types';
import { createZodDto } from 'nestjs-zod';

export class QueryStockReportDto extends createZodDto(queryStockReportSchema) {}
