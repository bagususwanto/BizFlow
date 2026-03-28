import { convertQuotationSchema } from '@bizflow/types';
import { createZodDto } from 'nestjs-zod';
export class ConvertQuotationDto extends createZodDto(convertQuotationSchema) {}
