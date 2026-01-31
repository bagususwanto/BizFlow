import { createZodDto } from 'nestjs-zod';
import { searchProductsSchema } from '@bizflow/types';

export class SearchProductsDto extends createZodDto(searchProductsSchema) {}
