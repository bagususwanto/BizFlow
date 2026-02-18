import { queryGoodsReceivesSchema } from '@bizflow/types';
import { createZodDto } from 'nestjs-zod';

export class QueryGoodsReceivesDto extends createZodDto(
  queryGoodsReceivesSchema,
) {}
