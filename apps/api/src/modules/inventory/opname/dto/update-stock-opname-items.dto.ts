import { updateStockOpnameItemsSchema } from '@bizflow/types';
import { createZodDto } from 'nestjs-zod';

export class UpdateStockOpnameItemsDto extends createZodDto(
  updateStockOpnameItemsSchema,
) {}
