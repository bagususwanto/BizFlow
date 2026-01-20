import { createZodDto } from 'nestjs-zod';
import {
  createProductSchema,
  updateProductSchema,
  queryProductsSchema,
} from '@bizflow/types';

export class CreateProductDto extends createZodDto(createProductSchema) {}

export class UpdateProductDto extends createZodDto(updateProductSchema) {}

export class QueryProductsDto extends createZodDto(queryProductsSchema) {}
