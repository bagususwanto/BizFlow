import {
  CreateSalesReturnValues,
  UpdateSalesReturnValues,
  UpdateSalesReturnStatusValues,
  QuerySalesReturnsValues,
  ApiResponse,
  SalesReturn,
} from '@bizflow/types';
import { apiClient } from '@/lib/fetch-client';
import { buildSearchParams } from '@/lib/utils';

export interface SalesReturnListResponse {
  data: SalesReturn[];
  meta: {
    page: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
  };
  summary: {
    totalReturns: number;
    pendingReturns: number;
    approvedReturns: number;
    rejectedReturns: number;
    completedReturns: number;
  };
}

class SalesReturnsService {
  async getAll(
    params?: QuerySalesReturnsValues,
  ): Promise<SalesReturnListResponse> {
    const searchParams = buildSearchParams(params || {});
    return apiClient.get<SalesReturnListResponse>(
      `/sales/returns?${searchParams.toString()}`,
    );
  }

  async getById(id: string): Promise<SalesReturn> {
    const res = await apiClient.get<ApiResponse<SalesReturn>>(
      `/sales/returns/${id}`,
    );
    return res.data!;
  }

  async create(data: CreateSalesReturnValues): Promise<SalesReturn> {
    const res = await apiClient.post<ApiResponse<SalesReturn>>(
      '/sales/returns',
      data,
    );
    return res.data!;
  }

  async update(
    id: string,
    data: UpdateSalesReturnValues,
  ): Promise<SalesReturn> {
    const res = await apiClient.patch<ApiResponse<SalesReturn>>(
      `/sales/returns/${id}`,
      data,
    );
    return res.data!;
  }

  async updateStatus(
    id: string,
    data: UpdateSalesReturnStatusValues,
  ): Promise<SalesReturn> {
    const res = await apiClient.patch<ApiResponse<SalesReturn>>(
      `/sales/returns/${id}/status`,
      data,
    );
    return res.data!;
  }

  async delete(id: string): Promise<ApiResponse<void>> {
    return apiClient.delete<ApiResponse<void>>(`/sales/returns/${id}`);
  }

  async bulkDelete(ids: string[]): Promise<ApiResponse<void>> {
    return apiClient.post<ApiResponse<void>>('/sales/returns/bulk-delete', {
      ids,
    });
  }

  async generateReturnNumber(): Promise<string> {
    const res = await apiClient.get<ApiResponse<{ returnNumber: string }>>(
      '/sales/returns/generate-return-number',
    );
    return res.data!.returnNumber;
  }
}

export const salesReturnsService = new SalesReturnsService();
