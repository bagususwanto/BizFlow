import { updateSupplierPaymentSchema } from '@bizflow/types';
import { createZodDto } from 'nestjs-zod';

export class UpdateSupplierPaymentDto extends createZodDto(
  updateSupplierPaymentSchema,
) {}
