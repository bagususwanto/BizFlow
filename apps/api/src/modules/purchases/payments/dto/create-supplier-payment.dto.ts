import { createSupplierPaymentSchema } from '@bizflow/types';
import { createZodDto } from 'nestjs-zod';

export class CreateSupplierPaymentDto extends createZodDto(
  createSupplierPaymentSchema,
) {}
