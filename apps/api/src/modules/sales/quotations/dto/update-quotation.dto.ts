import { updateQuotationSchema } from '@bizflow/types';
import { createZodDto } from 'nestjs-zod';
export class UpdateQuotationDto extends createZodDto(updateQuotationSchema) {}
