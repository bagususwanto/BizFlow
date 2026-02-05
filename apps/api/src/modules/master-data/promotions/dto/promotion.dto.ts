import { createZodDto } from 'nestjs-zod';
import {
  createPromotionSchema,
  updatePromotionSchema,
  queryPromotionsSchema,
} from '@bizflow/types';

export class CreatePromotionDto extends createZodDto(createPromotionSchema) {}

export class UpdatePromotionDto extends createZodDto(updatePromotionSchema) {}

export class QueryPromotionsDto extends createZodDto(queryPromotionsSchema) {}
