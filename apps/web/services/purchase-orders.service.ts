import {
  CreatePurchaseOrderValues,
  UpdatePurchaseOrderValues,
  QueryPurchaseOrdersValues,
  UpdatePurchaseOrderStatusValues,
  ApiResponse,
  PurchaseOrder,
} from '@bizflow/types';
import { apiClient } from '@/lib/fetch-client';
import { buildSearchParams } from '@/lib/utils';

export interface PurchaseOrderListResponse {
  data: PurchaseOrder[];
  meta: {
    page: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
  };
  summary: {
    totalOrders: number;
    draftOrders: number;
    orderedOrders: number;
    receivedOrders: number;
    completedOrders: number;
    cancelledOrders: number;
  };
}

class PurchaseOrdersService {
  async getAll(
    params?: QueryPurchaseOrdersValues,
  ): Promise<PurchaseOrderListResponse> {
    const searchParams = buildSearchParams(params || {});
    return apiClient.get<PurchaseOrderListResponse>(
      `/purchases/orders?${searchParams.toString()}`,
    );
  }

  async getById(id: string): Promise<PurchaseOrder> {
    const res = await apiClient.get<ApiResponse<PurchaseOrder>>(
      `/purchases/orders/${id}`,
    );
    return res.data!;
  }

  async create(data: CreatePurchaseOrderValues): Promise<PurchaseOrder> {
    const res = await apiClient.post<ApiResponse<PurchaseOrder>>(
      '/purchases/orders',
      data,
    );
    return res.data!;
  }

  async update(
    id: string,
    data: UpdatePurchaseOrderValues,
  ): Promise<PurchaseOrder> {
    const res = await apiClient.patch<ApiResponse<PurchaseOrder>>(
      `/purchases/orders/${id}`,
      data,
    );
    return res.data!;
  }

  async updateStatus(
    id: string,
    data: UpdatePurchaseOrderStatusValues,
  ): Promise<PurchaseOrder> {
    const res = await apiClient.patch<ApiResponse<PurchaseOrder>>(
      `/purchases/orders/${id}/status`,
      data,
    );
    return res.data!;
  }

  async delete(id: string): Promise<ApiResponse<void>> {
    return apiClient.delete<ApiResponse<void>>(`/purchases/orders/${id}`);
  }

  async bulkDelete(ids: string[]): Promise<ApiResponse<void>> {
    return apiClient.post<ApiResponse<void>>('/purchases/orders/bulk-delete', {
      ids,
    });
  }

  async generateOrderNumber(): Promise<string> {
    const res = await apiClient.get<ApiResponse<{ orderNumber: string }>>(
      '/purchases/orders/generate-order-number',
    );
    return res.data!.orderNumber;
  }
}

export const purchaseOrdersService = new PurchaseOrdersService();
