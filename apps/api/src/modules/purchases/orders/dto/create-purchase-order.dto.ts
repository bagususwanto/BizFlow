import { createPurchaseOrderSchema } from '@bizflow/types';
import { createZodDto } from 'nestjs-zod';

export class CreatePurchaseOrderDto extends createZodDto(
  createPurchaseOrderSchema,
) {}
