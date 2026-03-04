import { updateStockAdjustmentSchema } from '@bizflow/types';
import { createZodDto } from 'nestjs-zod';

export class UpdateStockAdjustmentDto extends createZodDto(
  updateStockAdjustmentSchema,
) {}
