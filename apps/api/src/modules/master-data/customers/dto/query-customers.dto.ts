import { queryCustomersSchema } from '@bizflow/types';
import { createZodDto } from 'nestjs-zod';

export class QueryCustomersDto extends createZodDto(queryCustomersSchema) {}
