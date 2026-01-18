import { createZodDto } from 'nestjs-zod';
import {
  createCategorySchema,
  updateCategorySchema,
  queryCategoriesSchema,
} from '@bizflow/types';

export class CreateCategoryDto extends createZodDto(createCategorySchema) {}

export class UpdateCategoryDto extends createZodDto(updateCategorySchema) {}

export class QueryCategoriesDto extends createZodDto(queryCategoriesSchema) {}
