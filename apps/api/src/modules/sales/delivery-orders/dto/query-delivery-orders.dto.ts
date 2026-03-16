import { queryDeliveryOrdersSchema } from '@bizflow/types';
import { createZodDto } from 'nestjs-zod';

export class QueryDeliveryOrdersDto extends createZodDto(
  queryDeliveryOrdersSchema,
) {}
