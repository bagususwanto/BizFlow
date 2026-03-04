import { createStockAdjustmentSchema } from '@bizflow/types';
import { createZodDto } from 'nestjs-zod';

export class CreateStockAdjustmentDto extends createZodDto(
  createStockAdjustmentSchema,
) {}
