import { updateStockLotSchema } from '@bizflow/types';
import { createZodDto } from 'nestjs-zod';

export class UpdateStockLotDto extends createZodDto(updateStockLotSchema) {}
