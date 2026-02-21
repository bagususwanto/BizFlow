import { z } from 'zod';

const goodsReceiveItemSchema = z.object({
  purchaseOrderItemId: z.string().min(1, 'Purchase Order Item wajib dipilih'),
  receivedQty: z.number().positive('Quantity harus lebih dari 0'),
  notes: z.string().optional().nullable(),
});

export const createGoodsReceiveSchema = z.object({
  receiveNumber: z.string().optional(),
  purchaseOrderId: z.string().min(1, 'Purchase Order wajib dipilih'),
  warehouseId: z.string().min(1, 'Gudang wajib dipilih'),
  receiveDate: z.string().datetime().or(z.date()).optional().nullable(),
  notes: z.string().optional().nullable(),
  items: z.array(goodsReceiveItemSchema).min(1, 'Minimal 1 item diperlukan'),
});

export const queryGoodsReceivesSchema = z.object({
  page: z.string().optional().transform(Number),
  pageSize: z.string().optional().transform(Number),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
  search: z.string().optional(),
  purchaseOrderId: z.string().optional(),
  warehouseId: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

export type CreateGoodsReceiveValues = z.infer<typeof createGoodsReceiveSchema>;
export type QueryGoodsReceivesValues = z.infer<typeof queryGoodsReceivesSchema>;
