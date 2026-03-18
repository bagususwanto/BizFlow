import { querySalesReturnsSchema } from '@bizflow/types';
import { createZodDto } from 'nestjs-zod';

export class QuerySalesReturnsDto extends createZodDto(
  querySalesReturnsSchema,
) {}
