import { updateSupplierSchema } from '@bizflow/types';
import { createZodDto } from 'nestjs-zod';

export class UpdateSupplierDto extends createZodDto(updateSupplierSchema) {}
