import { z } from 'zod';

const deliveryOrderItemSchema = z.object({
  orderItemId: z
    .string()
    .min(1, 'sales.delivery.validation.orderItemRequired'),
  variantId: z.string().min(1, 'sales.delivery.validation.variantRequired'),
  quantity: z.number().positive('sales.delivery.validation.quantityMin'),
  notes: z.string().optional().nullable(),
});

const deliveryOrderBaseSchema = z.object({
  deliveryNumber: z.string().optional(),
  orderId: z.string().min(1, 'sales.delivery.validation.orderRequired'),
  invoiceId: z.string().optional().nullable(),
  warehouseId: z
    .string()
    .min(1, 'sales.delivery.validation.warehouseRequired'),
  deliveryDate: z.string().datetime().or(z.date()).optional().nullable(),
  shippingAddress: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
  items: z
    .array(deliveryOrderItemSchema)
    .min(1, 'sales.delivery.validation.itemsMin'),
});

export const createDeliveryOrderSchema = deliveryOrderBaseSchema;

export const updateDeliveryOrderSchema = deliveryOrderBaseSchema
  .partial()
  .extend({
    items: z.array(deliveryOrderItemSchema).min(1).optional(),
  });

export const queryDeliveryOrdersSchema = z.object({
  page: z.string().optional().transform(Number),
  pageSize: z.string().optional().transform(Number),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
  search: z.string().optional(),
  status: z
    .enum(['draft', 'in_transit', 'delivered', 'cancelled'])
    .optional(),
  orderId: z.string().optional(),
  warehouseId: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

export const updateDeliveryStatusSchema = z.object({
  status: z.enum(['draft', 'in_transit', 'delivered', 'cancelled']),
});

export type CreateDeliveryOrderValues = z.infer<
  typeof createDeliveryOrderSchema
>;
export type UpdateDeliveryOrderValues = z.infer<
  typeof updateDeliveryOrderSchema
>;
export type QueryDeliveryOrdersValues = z.infer<
  typeof queryDeliveryOrdersSchema
>;
export type UpdateDeliveryStatusValues = z.infer<
  typeof updateDeliveryStatusSchema
>;
