import { finalizeStockOpnameSchema } from '@bizflow/types';
import { createZodDto } from 'nestjs-zod';

export class FinalizeStockOpnameDto extends createZodDto(
  finalizeStockOpnameSchema,
) {}
