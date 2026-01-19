import { updateUnitSchema } from '@bizflow/types';
import { createZodDto } from 'nestjs-zod';

export class UpdateUnitDto extends createZodDto(updateUnitSchema) {}
