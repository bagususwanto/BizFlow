import { z } from 'zod';

// ========================================
// Audit Log Query Schema
// ========================================

export const auditLogQuerySchema = z.object({
  // Pagination
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),

  // Filters
  userId: z.string().optional(),
  module: z.string().optional(),
  action: z.string().optional(),
  search: z.string().optional(),

  // Date range
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

export type AuditLogQueryValues = z.infer<typeof auditLogQuerySchema>;

// Alias for frontend usage
export type AuditLogQuery = AuditLogQueryValues;
