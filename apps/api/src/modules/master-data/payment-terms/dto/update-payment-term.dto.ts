import { updatePaymentTermSchema } from '@bizflow/types';
import { createZodDto } from 'nestjs-zod';

export class UpdatePaymentTermDto extends createZodDto(
  updatePaymentTermSchema,
) {}
