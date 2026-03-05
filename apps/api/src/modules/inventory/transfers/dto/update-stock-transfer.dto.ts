import { updateStockTransferSchema } from '@bizflow/types';
import { createZodDto } from 'nestjs-zod';

export class UpdateStockTransferDto extends createZodDto(
  updateStockTransferSchema,
) {}
