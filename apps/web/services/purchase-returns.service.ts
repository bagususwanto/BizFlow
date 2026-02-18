import {
  CreatePurchaseReturnValues,
  UpdatePurchaseReturnValues,
  UpdatePurchaseReturnStatusValues,
  QueryPurchaseReturnsValues,
  ApiResponse,
  PurchaseReturn,
} from '@bizflow/types';
import { apiClient } from '@/lib/fetch-client';
import { buildSearchParams } from '@/lib/utils';

export interface PurchaseReturnListResponse {
  data: PurchaseReturn[];
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

class PurchaseReturnsService {
  async getAll(
    params?: QueryPurchaseReturnsValues,
  ): Promise<PurchaseReturnListResponse> {
    const searchParams = buildSearchParams(params || {});
    return apiClient.get<PurchaseReturnListResponse>(
      `/purchases/returns?${searchParams.toString()}`,
    );
  }

  async getById(id: string): Promise<PurchaseReturn> {
    const res = await apiClient.get<ApiResponse<PurchaseReturn>>(
      `/purchases/returns/${id}`,
    );
    return res.data!;
  }

  async create(data: CreatePurchaseReturnValues): Promise<PurchaseReturn> {
    const res = await apiClient.post<ApiResponse<PurchaseReturn>>(
      '/purchases/returns',
      data,
    );
    return res.data!;
  }

  async update(
    id: string,
    data: UpdatePurchaseReturnValues,
  ): Promise<PurchaseReturn> {
    const res = await apiClient.patch<ApiResponse<PurchaseReturn>>(
      `/purchases/returns/${id}`,
      data,
    );
    return res.data!;
  }

  async updateStatus(
    id: string,
    data: UpdatePurchaseReturnStatusValues,
  ): Promise<PurchaseReturn> {
    const res = await apiClient.patch<ApiResponse<PurchaseReturn>>(
      `/purchases/returns/${id}/status`,
      data,
    );
    return res.data!;
  }

  async delete(id: string): Promise<ApiResponse<void>> {
    return apiClient.delete<ApiResponse<void>>(`/purchases/returns/${id}`);
  }

  async bulkDelete(ids: string[]): Promise<ApiResponse<void>> {
    return apiClient.post<ApiResponse<void>>('/purchases/returns/bulk-delete', {
      ids,
    });
  }

  async generateReturnNumber(): Promise<string> {
    const res = await apiClient.get<ApiResponse<{ returnNumber: string }>>(
      '/purchases/returns/generate-return-number',
    );
    return res.data!.returnNumber;
  }
}

export const purchaseReturnsService = new PurchaseReturnsService();
