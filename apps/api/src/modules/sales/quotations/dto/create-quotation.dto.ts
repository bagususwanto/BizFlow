import { createQuotationSchema } from '@bizflow/types';
import { createZodDto } from 'nestjs-zod';
export class CreateQuotationDto extends createZodDto(createQuotationSchema) {}
