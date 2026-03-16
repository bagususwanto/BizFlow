import { querySalesOrdersSchema } from '@bizflow/types';
import { createZodDto } from 'nestjs-zod';

export class QuerySalesOrdersDto extends createZodDto(
  querySalesOrdersSchema,
) {}
