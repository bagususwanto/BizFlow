import { updateQuotationStatusSchema } from '@bizflow/types';
import { createZodDto } from 'nestjs-zod';
export class UpdateQuotationStatusDto extends createZodDto(updateQuotationStatusSchema) {}
