import { updateDeliveryStatusSchema } from '@bizflow/types';
import { createZodDto } from 'nestjs-zod';

export class UpdateDeliveryStatusDto extends createZodDto(
  updateDeliveryStatusSchema,
) {}
