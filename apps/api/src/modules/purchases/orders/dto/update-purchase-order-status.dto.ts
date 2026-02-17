import { updatePurchaseOrderStatusSchema } from '@bizflow/types';
import { createZodDto } from 'nestjs-zod';

export class UpdatePurchaseOrderStatusDto extends createZodDto(
  updatePurchaseOrderStatusSchema,
) {}
