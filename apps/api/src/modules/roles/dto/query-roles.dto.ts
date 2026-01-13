import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

export const queryRolesSchema = z.object({
  // Pagination
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(10),

  // Sorting
  sortBy: z
    .enum(['name', 'createdAt', 'updatedAt', 'userCount'])
    .default('name'),
  sortOrder: z.enum(['asc', 'desc']).default('asc'),

  // Filters
  search: z.string().optional(),
  isSystemRole: z.coerce.boolean().optional(),
});

export type QueryRolesValues = z.infer<typeof queryRolesSchema>;

export class QueryRolesDto extends createZodDto(queryRolesSchema) {}
