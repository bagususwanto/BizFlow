import {
  CreateSalesOrderValues,
  UpdateSalesOrderValues,
  QuerySalesOrdersValues,
  UpdateSalesOrderStatusValues,
  ApiResponse,
  SalesOrder,
} from '@bizflow/types';
import { apiClient } from '@/lib/fetch-client';
import { buildSearchParams } from '@/lib/utils';

export interface SalesOrderListResponse {
  data: SalesOrder[];
  meta: {
    page: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
  };
  summary: {
    totalOrders: number;
    draftOrders: number;
    confirmedOrders: number;
    invoicedOrders: number;
    completedOrders: number;
    cancelledOrders: number;
  };
}

class SalesOrdersService {
  async getAll(
    params?: QuerySalesOrdersValues,
  ): Promise<SalesOrderListResponse> {
    const searchParams = buildSearchParams(params || {});
    return apiClient.get<SalesOrderListResponse>(
      `/sales/orders?${searchParams.toString()}`,
    );
  }

  async getById(id: string): Promise<SalesOrder> {
    const res = await apiClient.get<ApiResponse<SalesOrder>>(
      `/sales/orders/${id}`,
    );
    return res.data!;
  }

  async create(data: CreateSalesOrderValues): Promise<SalesOrder> {
    const res = await apiClient.post<ApiResponse<SalesOrder>>(
      '/sales/orders',
      data,
    );
    return res.data!;
  }

  async update(
    id: string,
    data: UpdateSalesOrderValues,
  ): Promise<SalesOrder> {
    const res = await apiClient.patch<ApiResponse<SalesOrder>>(
      `/sales/orders/${id}`,
      data,
    );
    return res.data!;
  }

  async updateStatus(
    id: string,
    data: UpdateSalesOrderStatusValues,
  ): Promise<SalesOrder> {
    const res = await apiClient.patch<ApiResponse<SalesOrder>>(
      `/sales/orders/${id}/status`,
      data,
    );
    return res.data!;
  }

  async delete(id: string): Promise<ApiResponse<void>> {
    return apiClient.delete<ApiResponse<void>>(`/sales/orders/${id}`);
  }

  async bulkDelete(ids: string[]): Promise<ApiResponse<void>> {
    return apiClient.post<ApiResponse<void>>('/sales/orders/bulk-delete', {
      ids,
    });
  }

  async generateOrderNumber(): Promise<string> {
    const res = await apiClient.get<ApiResponse<{ orderNumber: string }>>(
      '/sales/orders/generate-order-number',
    );
    return res.data!.orderNumber;
  }
}

export const salesOrdersService = new SalesOrdersService();
