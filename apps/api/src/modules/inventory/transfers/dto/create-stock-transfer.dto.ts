import { createStockTransferSchema } from '@bizflow/types';
import { createZodDto } from 'nestjs-zod';

export class CreateStockTransferDto extends createZodDto(
  createStockTransferSchema,
) {}
