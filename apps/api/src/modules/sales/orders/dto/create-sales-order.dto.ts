import { createSalesOrderSchema } from '@bizflow/types';
import { createZodDto } from 'nestjs-zod';

export class CreateSalesOrderDto extends createZodDto(
  createSalesOrderSchema,
) {}
