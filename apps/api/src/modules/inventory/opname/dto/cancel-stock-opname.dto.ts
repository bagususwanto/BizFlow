import { cancelStockOpnameSchema } from '@bizflow/types';
import { createZodDto } from 'nestjs-zod';

export class CancelStockOpnameDto extends createZodDto(
  cancelStockOpnameSchema,
) {}
