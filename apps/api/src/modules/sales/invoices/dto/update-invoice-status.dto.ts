import { updateInvoiceStatusSchema } from '@bizflow/types';
import { createZodDto } from 'nestjs-zod';

export class UpdateInvoiceStatusDto extends createZodDto(
  updateInvoiceStatusSchema,
) {}
