import { queryInvoicesSchema } from '@bizflow/types';
import { createZodDto } from 'nestjs-zod';

export class QueryInvoicesDto extends createZodDto(queryInvoicesSchema) {}
