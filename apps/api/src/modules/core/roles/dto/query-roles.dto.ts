import { createZodDto } from 'nestjs-zod';
import { queryRolesSchema } from '@bizflow/types';

// export type QueryRolesValues = z.infer<typeof queryRolesSchema>; // Removed to avoid z import, use inferred type from zod-nestjs if needed or import z
export class QueryRolesDto extends createZodDto(queryRolesSchema) {}
