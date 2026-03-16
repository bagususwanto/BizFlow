import { updateSalesOrderStatusSchema } from '@bizflow/types';
import { createZodDto } from 'nestjs-zod';

export class UpdateSalesOrderStatusDto extends createZodDto(
  updateSalesOrderStatusSchema,
) {}
