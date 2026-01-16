import { createZodDto } from 'nestjs-zod';
import {
  createOutletSchema,
  updateOutletSchema,
  queryOutletsSchema,
} from '@bizflow/types';

export class CreateOutletDto extends createZodDto(createOutletSchema) {}

export class UpdateOutletDto extends createZodDto(updateOutletSchema) {}

export class QueryOutletsDto extends createZodDto(queryOutletsSchema) {}
