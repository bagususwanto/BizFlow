import { updateStockTransferStatusSchema } from '@bizflow/types';
import { createZodDto } from 'nestjs-zod';

export class UpdateStockTransferStatusDto extends createZodDto(
  updateStockTransferStatusSchema,
) {}
