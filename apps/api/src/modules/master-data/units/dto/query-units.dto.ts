import { queryUnitsSchema } from '@bizflow/types';
import { createZodDto } from 'nestjs-zod';

export class QueryUnitsDto extends createZodDto(queryUnitsSchema) {}
