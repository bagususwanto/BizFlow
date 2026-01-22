import { createZodDto } from 'nestjs-zod';
import { createPriceLevelSchema, updatePriceLevelSchema } from '@bizflow/types';

export class CreatePriceLevelDto extends createZodDto(createPriceLevelSchema) {}

export class UpdatePriceLevelDto extends createZodDto(updatePriceLevelSchema) {}
