import { queryPaymentTermsSchema } from '@bizflow/types';
import { createZodDto } from 'nestjs-zod';

export class QueryPaymentTermsDto extends createZodDto(
  queryPaymentTermsSchema,
) {}
