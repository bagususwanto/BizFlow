import { queryQuotationsSchema } from '@bizflow/types';
import { createZodDto } from 'nestjs-zod';
export class QueryQuotationsDto extends createZodDto(queryQuotationsSchema) {}
