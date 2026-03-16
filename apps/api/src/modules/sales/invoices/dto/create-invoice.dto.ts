import { createInvoiceSchema } from '@bizflow/types';
import { createZodDto } from 'nestjs-zod';

export class CreateInvoiceDto extends createZodDto(createInvoiceSchema) {}
