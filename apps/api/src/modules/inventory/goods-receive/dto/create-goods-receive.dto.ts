import { createGoodsReceiveSchema } from '@bizflow/types';
import { createZodDto } from 'nestjs-zod';

export class CreateGoodsReceiveDto extends createZodDto(
  createGoodsReceiveSchema,
) {}
