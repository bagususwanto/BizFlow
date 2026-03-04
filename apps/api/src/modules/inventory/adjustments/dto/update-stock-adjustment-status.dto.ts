import { updateStockAdjustmentStatusSchema } from '@bizflow/types';
import { createZodDto } from 'nestjs-zod';

export class UpdateStockAdjustmentStatusDto extends createZodDto(
  updateStockAdjustmentStatusSchema,
) {}
