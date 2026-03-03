import { z } from 'zod';

// ========================================
// Printer Schemas
// ========================================

// ========================================
// Create Printer Schema
// ========================================

export const createPrinterSchema = z.object({
  name: z
    .string()
    .min(1, { message: 'printers.validation.nameRequired' })
    .max(100, { message: 'printers.validation.nameMax' }),
  type: z.enum(['network', 'usb'], {
    message: 'printers.validation.typeRequired',
  }),
  address: z.preprocess(
    (val) => (val === '' ? undefined : val),
    z
      .string()
      .max(255, { message: 'printers.validation.addressMax' })
      .optional(),
  ),
  width: z.coerce
    .number()
    .int()
    .refine((v) => v === 58 || v === 80, {
      message: 'printers.validation.widthRequired',
    })
    .default(58),
  isDefault: z.boolean().default(false),
  isActive: z.boolean().default(true),
  outletId: z
    .string()
    .min(1, { message: 'printers.validation.outletRequired' }),
});

export type CreatePrinterValues = z.infer<typeof createPrinterSchema>;

// ========================================
// Update Printer Schema
// ========================================

export const updatePrinterSchema = z.object({
  name: z
    .string()
    .min(1, { message: 'printers.validation.nameRequired' })
    .max(100, { message: 'printers.validation.nameMax' })
    .optional(),
  type: z
    .enum(['network', 'usb'], {
      message: 'printers.validation.typeRequired',
    })
    .optional(),
  address: z.preprocess(
    (val) => (val === '' ? undefined : val),
    z
      .string()
      .max(255, { message: 'printers.validation.addressMax' })
      .optional()
      .nullable(),
  ),
  width: z.coerce
    .number()
    .int()
    .refine((v) => v === 58 || v === 80, {
      message: 'printers.validation.widthRequired',
    })
    .optional(),
  isDefault: z.boolean().optional(),
  isActive: z.boolean().optional(),
});

export type UpdatePrinterValues = z.infer<typeof updatePrinterSchema>;

// ========================================
// Query Printers Schema
// ========================================

export const queryPrintersSchema = z.object({
  // Pagination
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(10),

  // Sorting
  sortBy: z.enum(['name', 'createdAt', 'updatedAt']).default('name'),
  sortOrder: z.enum(['asc', 'desc']).default('asc'),

  // Filters
  search: z.string().optional(),
  outletId: z.string().optional(),
  type: z.enum(['network', 'usb']).optional(),
  isActive: z.preprocess((val) => {
    if (typeof val === 'string') {
      if (val === 'true') return true;
      if (val === 'false') return false;
    }
    return val;
  }, z.boolean().optional()),
});

export type QueryPrintersValues = z.infer<typeof queryPrintersSchema>;

// ========================================
// Print Receipt Schema
// ========================================

export const printReceiptSchema = z.object({
  transactionId: z.string().min(1, { message: 'ID transaksi harus diisi' }),
  printerId: z.string().optional(),
  outletId: z.string().optional(),
});

export type PrintReceiptValues = z.infer<typeof printReceiptSchema>;
