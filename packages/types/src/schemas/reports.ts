import { z } from 'zod';

// ========================================
// Query Dashboard Schema
// ========================================

export const queryDashboardSchema = z.object({
  outletId: z.string().optional(),
});

export type QueryDashboardValues = z.infer<typeof queryDashboardSchema>;

// ========================================
// Query Sales Report Schema
// ========================================

export const querySalesReportSchema = z.object({
  period: z.enum(['today', 'week', 'month', 'custom']).optional(),
  startDate: z.string().optional(), // ISO date string
  endDate: z.string().optional(), // ISO date string
  outletId: z.string().optional(),
  categoryId: z.string().optional(),
  page: z.coerce.number().int().positive().optional(),
  pageSize: z.coerce.number().int().positive().optional(),
});

export type QuerySalesReportValues = z.infer<typeof querySalesReportSchema>;

// ========================================
// Query Stock Report Schema
// ========================================

export const queryStockReportSchema = z.object({
  warehouseId: z.string().optional(),
  categoryId: z.string().optional(),
  lowStockOnly: z
    .enum(['true', 'false'])
    .optional()
    .transform((val) => val === 'true'),
  page: z.coerce.number().int().positive().optional(),
  pageSize: z.coerce.number().int().positive().optional(),
});

export type QueryStockReportValues = z.infer<typeof queryStockReportSchema>;
