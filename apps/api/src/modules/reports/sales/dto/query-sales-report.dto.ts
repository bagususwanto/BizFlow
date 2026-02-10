import { querySalesReportSchema } from '@bizflow/types';
import { createZodDto } from 'nestjs-zod';

export class QuerySalesReportDto extends createZodDto(querySalesReportSchema) {}
