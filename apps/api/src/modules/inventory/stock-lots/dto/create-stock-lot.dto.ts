import { createStockLotSchema } from '@bizflow/types';
import { createZodDto } from 'nestjs-zod';

export class CreateStockLotDto extends createZodDto(createStockLotSchema) {}
