import { updatePurchaseReturnSchema } from '@bizflow/types';
import { createZodDto } from 'nestjs-zod';

export class UpdatePurchaseReturnDto extends createZodDto(
  updatePurchaseReturnSchema,
) {}
