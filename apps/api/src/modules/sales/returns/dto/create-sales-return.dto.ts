import { createSalesReturnSchema } from '@bizflow/types';
import { createZodDto } from 'nestjs-zod';

export class CreateSalesReturnDto extends createZodDto(
  createSalesReturnSchema,
) {}
