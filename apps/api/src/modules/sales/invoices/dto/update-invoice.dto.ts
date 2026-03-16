import { updateInvoiceSchema } from '@bizflow/types';
import { createZodDto } from 'nestjs-zod';

export class UpdateInvoiceDto extends createZodDto(updateInvoiceSchema) {}
