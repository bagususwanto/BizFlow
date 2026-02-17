import { updatePurchaseOrderSchema } from '@bizflow/types';
import { createZodDto } from 'nestjs-zod';

export class UpdatePurchaseOrderDto extends createZodDto(
  updatePurchaseOrderSchema,
) {}
