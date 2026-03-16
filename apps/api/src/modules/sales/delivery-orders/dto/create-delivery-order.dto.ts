import { createDeliveryOrderSchema } from '@bizflow/types';
import { createZodDto } from 'nestjs-zod';

export class CreateDeliveryOrderDto extends createZodDto(
  createDeliveryOrderSchema,
) {}
