import { createPurchaseReturnSchema } from '@bizflow/types';
import { createZodDto } from 'nestjs-zod';

export class CreatePurchaseReturnDto extends createZodDto(
  createPurchaseReturnSchema,
) {}
