import { createZodDto } from 'nestjs-zod';
import { querySettingsSchema, updateSettingsSchema } from '@bizflow/types';

export class QuerySettingsDto extends createZodDto(querySettingsSchema) {}

export class UpdateSettingsDto extends createZodDto(updateSettingsSchema) {}
