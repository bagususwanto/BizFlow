import { createZodDto } from 'nestjs-zod';
import { createVariantSchema, updateVariantSchema } from '@bizflow/types';

export class CreateVariantDto extends createZodDto(createVariantSchema) {}

export class UpdateVariantDto extends createZodDto(updateVariantSchema) {}
