import { createUnitSchema } from '@bizflow/types';
import { createZodDto } from 'nestjs-zod';

export class CreateUnitDto extends createZodDto(createUnitSchema) {}
