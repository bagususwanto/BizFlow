import { updateDeliveryOrderSchema } from '@bizflow/types';
import { createZodDto } from 'nestjs-zod';

export class UpdateDeliveryOrderDto extends createZodDto(
  updateDeliveryOrderSchema,
) {}
