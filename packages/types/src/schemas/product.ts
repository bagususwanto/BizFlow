import { z } from 'zod';

// ========================================
// Product Schemas
// ========================================

// ========================================
// Create Product Schema
// ========================================

export const createProductSchema = z.object({
  sku: z.preprocess(
    (val) => (val === '' ? undefined : val),
    z
      .string()
      .min(1, { message: 'SKU wajib diisi' })
      .max(50, { message: 'SKU maksimal 50 karakter' })
      .optional(),
  ),
  barcode: z.preprocess(
    (val) => (val === '' ? null : val),
    z
      .string()
      .min(8, { message: 'Barcode minimal 8 karakter' })
      .max(14, { message: 'Barcode maksimal 14 karakter' })
      .regex(/^[0-9]+$/, { message: 'Barcode hanya boleh berisi angka' })
      .nullable()
      .optional(),
  ),
  name: z
    .string()
    .min(1, { message: 'Nama produk wajib diisi' })
    .max(200, { message: 'Nama produk maksimal 200 karakter' }),
  description: z.preprocess(
    (val) => (val === '' ? null : val),
    z
      .string()
      .max(1000, { message: 'Deskripsi maksimal 1000 karakter' })
      .nullable()
      .optional(),
  ),
  categoryId: z.string().min(1, { message: 'Kategori wajib dipilih' }),
  unitId: z.string().min(1, { message: 'Satuan wajib dipilih' }),
  costPrice: z.coerce
    .number()
    .min(0, { message: 'Harga beli tidak boleh negatif' }),
  sellPrice: z.coerce
    .number()
    .min(0, { message: 'Harga jual tidak boleh negatif' }),
  minStock: z.coerce
    .number()
    .int()
    .min(0, { message: 'Stok minimum tidak boleh negatif' })
    .default(0),
  isService: z.boolean().default(false),
  isActive: z.boolean().default(true),
  images: z.array(z.string()).optional().default([]),
});

export type CreateProductValues = z.infer<typeof createProductSchema>;

// ========================================
// Update Product Schema
// ========================================

export const updateProductSchema = z.object({
  sku: z.preprocess(
    (val) => (val === '' ? undefined : val),
    z
      .string()
      .min(1, { message: 'SKU wajib diisi' })
      .max(50, { message: 'SKU maksimal 50 karakter' })
      .optional(),
  ),
  barcode: z.preprocess(
    (val) => (val === '' ? null : val),
    z
      .string()
      .min(8, { message: 'Barcode minimal 8 karakter' })
      .max(14, { message: 'Barcode maksimal 14 karakter' })
      .regex(/^[0-9]+$/, { message: 'Barcode hanya boleh berisi angka' })
      .nullable()
      .optional(),
  ),
  name: z
    .string()
    .min(1, { message: 'Nama produk wajib diisi' })
    .max(200, { message: 'Nama produk maksimal 200 karakter' })
    .optional(),
  description: z.preprocess(
    (val) => (val === '' ? null : val),
    z
      .string()
      .max(1000, { message: 'Deskripsi maksimal 1000 karakter' })
      .nullable()
      .optional(),
  ),
  categoryId: z.string().min(1).optional(),
  unitId: z.string().min(1).optional(),
  costPrice: z.coerce
    .number()
    .min(0, { message: 'Harga beli tidak boleh negatif' })
    .optional(),
  sellPrice: z.coerce
    .number()
    .min(0, { message: 'Harga jual tidak boleh negatif' })
    .optional(),
  minStock: z.coerce
    .number()
    .int()
    .min(0, { message: 'Stok minimum tidak boleh negatif' })
    .optional(),
  isService: z.boolean().optional(),
  isActive: z.boolean().optional(),
  images: z.array(z.string()).optional(),
});

export type UpdateProductValues = z.infer<typeof updateProductSchema>;

// ========================================
// Query Products Schema
// ========================================

export const queryProductsSchema = z.object({
  // Pagination
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(10),

  // Sorting
  sortBy: z
    .enum(['name', 'sku', 'costPrice', 'sellPrice', 'createdAt', 'updatedAt'])
    .default('name'),
  sortOrder: z.enum(['asc', 'desc']).default('asc'),

  // Filters
  search: z.string().optional(),
  categoryId: z.string().optional(),
  isActive: z.preprocess((val) => {
    if (typeof val === 'string') {
      if (val === 'true') return true;
      if (val === 'false') return false;
    }
    return val;
  }, z.boolean().optional()),
  isService: z.preprocess((val) => {
    if (typeof val === 'string') {
      if (val === 'true') return true;
      if (val === 'false') return false;
    }
    return val;
  }, z.boolean().optional()),
  hasLowStock: z.preprocess((val) => {
    if (typeof val === 'string') {
      if (val === 'true') return true;
      if (val === 'false') return false;
    }
    return val;
  }, z.boolean().optional()),
});

export type QueryProductsValues = z.infer<typeof queryProductsSchema>;

// ========================================
// Product Image Schemas
// ========================================

export const productImageSchema = z.object({
  id: z.string().optional(),
  productId: z.string().optional(),
  url: z.string().min(1, { message: 'URL gambar wajib diisi' }),
  order: z.coerce.number().int().default(0),
});

export type ProductImageValues = z.infer<typeof productImageSchema>;

// ========================================
// Price Level Schemas
// ========================================

export const createPriceLevelSchema = z.object({
  name: z
    .string()
    .min(1, { message: 'Nama level harga wajib diisi' })
    .max(50, { message: 'Nama level harga maksimal 50 karakter' }),
  minQty: z.coerce
    .number()
    .int()
    .min(1, { message: 'Minimum qty minimal 1' })
    .default(1),
  price: z.coerce.number().min(0, { message: 'Harga tidak boleh negatif' }),
});

export type CreatePriceLevelValues = z.infer<typeof createPriceLevelSchema>;

export const updatePriceLevelSchema = createPriceLevelSchema.partial();

export type UpdatePriceLevelValues = z.infer<typeof updatePriceLevelSchema>;

// ========================================
// Product Variant Schemas
// ========================================

export const createVariantSchema = z.object({
  sku: z
    .string()
    .min(1, { message: 'SKU wajib diisi' })
    .max(50, { message: 'SKU maksimal 50 karakter' })
    .optional(),
  barcode: z.preprocess(
    (val) => (val === '' ? null : val),
    z
      .string()
      .min(8, { message: 'Barcode minimal 8 karakter' })
      .max(14, { message: 'Barcode maksimal 14 karakter' })
      .regex(/^[0-9]+$/, { message: 'Barcode hanya boleh berisi angka' })
      .nullable()
      .optional(),
  ),
  name: z
    .string()
    .min(1, { message: 'Nama varian wajib diisi' })
    .max(200, { message: 'Nama varian maksimal 200 karakter' }),
  attributes: z.record(z.string(), z.any()).default({}),
  costPrice: z.coerce
    .number()
    .min(0, { message: 'Harga beli tidak boleh negatif' }),
  sellPrice: z.coerce
    .number()
    .min(0, { message: 'Harga jual tidak boleh negatif' }),
});

export type CreateVariantValues = z.infer<typeof createVariantSchema>;

export const updateVariantSchema = createVariantSchema.partial();

export type UpdateVariantValues = z.infer<typeof updateVariantSchema>;
