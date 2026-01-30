import { queryWarehousesSchema } from '@bizflow/types';
import { createZodDto } from 'nestjs-zod';

export class QueryWarehousesDto extends createZodDto(queryWarehousesSchema) {}
