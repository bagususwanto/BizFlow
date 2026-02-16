import { querySuppliersSchema } from '@bizflow/types';
import { createZodDto } from 'nestjs-zod';

export class QuerySuppliersDto extends createZodDto(querySuppliersSchema) {}
