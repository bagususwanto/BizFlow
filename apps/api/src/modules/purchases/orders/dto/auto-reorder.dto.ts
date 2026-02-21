import { autoReorderSchema } from '@bizflow/types';
import { createZodDto } from 'nestjs-zod';

export class AutoReorderDto extends createZodDto(autoReorderSchema) {}
