import { updateSalesOrderSchema } from '@bizflow/types';
import { createZodDto } from 'nestjs-zod';

export class UpdateSalesOrderDto extends createZodDto(
  updateSalesOrderSchema,
) {}
