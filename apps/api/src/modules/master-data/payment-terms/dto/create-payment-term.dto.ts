import { createPaymentTermSchema } from '@bizflow/types';
import { createZodDto } from 'nestjs-zod';

export class CreatePaymentTermDto extends createZodDto(
  createPaymentTermSchema,
) {}
