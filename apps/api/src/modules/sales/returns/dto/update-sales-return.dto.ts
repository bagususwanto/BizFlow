import { updateSalesReturnSchema } from '@bizflow/types';
import { createZodDto } from 'nestjs-zod';

export class UpdateSalesReturnDto extends createZodDto(
  updateSalesReturnSchema,
) {}
