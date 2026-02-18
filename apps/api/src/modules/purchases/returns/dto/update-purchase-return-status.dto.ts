import { updatePurchaseReturnStatusSchema } from '@bizflow/types';
import { createZodDto } from 'nestjs-zod';

export class UpdatePurchaseReturnStatusDto extends createZodDto(
  updatePurchaseReturnStatusSchema,
) {}
