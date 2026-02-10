import { queryDashboardSchema } from '@bizflow/types';
import { createZodDto } from 'nestjs-zod';

export class QueryDashboardDto extends createZodDto(queryDashboardSchema) {}
