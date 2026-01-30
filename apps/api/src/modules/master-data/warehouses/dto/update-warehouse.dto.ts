import { updateWarehouseSchema } from '@bizflow/types';
import { createZodDto } from 'nestjs-zod';

export class UpdateWarehouseDto extends createZodDto(updateWarehouseSchema) {}
