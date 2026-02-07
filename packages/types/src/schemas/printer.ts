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
    .min(1, { message: 'Nama printer wajib diisi' })
    .max(100, { message: 'Nama printer maksimal 100 karakter' }),
  type: z.enum(['network', 'usb'], {
    message: 'Tipe printer harus network atau usb',
  }),
  address: z.preprocess(
    (val) => (val === '' ? undefined : val),
    z
      .string()
      .max(100, { message: 'Alamat printer maksimal 100 karakter' })
      .optional(),
  ),
  width: z.coerce
    .number()
    .int()
    .refine((v) => v === 58 || v === 80, {
      message: 'Lebar kertas harus 58 atau 80 mm',
    })
    .default(58),
  isDefault: z.boolean().default(false),
  isActive: z.boolean().default(true),
  outletId: z.string().min(1, { message: 'Outlet harus dipilih' }),
});

export type CreatePrinterValues = z.infer<typeof createPrinterSchema>;

// ========================================
// Update Printer Schema
// ========================================

export const updatePrinterSchema = z.object({
  name: z
    .string()
    .min(1, { message: 'Nama printer wajib diisi' })
    .max(100, { message: 'Nama printer maksimal 100 karakter' })
    .optional(),
  type: z
    .enum(['network', 'usb'], {
      message: 'Tipe printer harus network atau usb',
    })
    .optional(),
  address: z.preprocess(
    (val) => (val === '' ? undefined : val),
    z
      .string()
      .max(100, { message: 'Alamat printer maksimal 100 karakter' })
      .optional()
      .nullable(),
  ),
  width: z.coerce
    .number()
    .int()
    .refine((v) => v === 58 || v === 80, {
      message: 'Lebar kertas harus 58 atau 80 mm',
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
