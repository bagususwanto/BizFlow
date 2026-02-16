import { createSupplierSchema } from '@bizflow/types';
import { createZodDto } from 'nestjs-zod';

export class CreateSupplierDto extends createZodDto(createSupplierSchema) {}
