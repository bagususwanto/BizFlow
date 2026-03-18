import { updateSalesReturnStatusSchema } from '@bizflow/types';
import { createZodDto } from 'nestjs-zod';

export class UpdateSalesReturnStatusDto extends createZodDto(
  updateSalesReturnStatusSchema,
) {}
