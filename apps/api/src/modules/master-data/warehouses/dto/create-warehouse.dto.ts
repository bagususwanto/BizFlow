import { createWarehouseSchema } from '@bizflow/types';
import { createZodDto } from 'nestjs-zod';

export class CreateWarehouseDto extends createZodDto(createWarehouseSchema) {}
