import { createStockOpnameSchema } from '@bizflow/types';
import { createZodDto } from 'nestjs-zod';

export class CreateStockOpnameDto extends createZodDto(
  createStockOpnameSchema,
) {}
