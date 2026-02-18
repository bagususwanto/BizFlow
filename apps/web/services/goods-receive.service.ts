import {
  CreateGoodsReceiveValues,
  QueryGoodsReceivesValues,
  ApiResponse,
  GoodsReceive,
} from '@bizflow/types';
import { apiClient } from '@/lib/fetch-client';
import { buildSearchParams } from '@/lib/utils';

export interface GoodsReceiveListResponse {
  data: GoodsReceive[];
  meta: {
    page: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
  };
}

class GoodsReceiveService {
  async getAll(
    params?: QueryGoodsReceivesValues,
  ): Promise<GoodsReceiveListResponse> {
    const searchParams = buildSearchParams(params || {});
    return apiClient.get<GoodsReceiveListResponse>(
      `/inventory/goods-receive?${searchParams.toString()}`,
    );
  }

  async getById(id: string): Promise<GoodsReceive> {
    const res = await apiClient.get<ApiResponse<GoodsReceive>>(
      `/inventory/goods-receive/${id}`,
    );
    return res.data!;
  }

  async create(data: CreateGoodsReceiveValues): Promise<GoodsReceive> {
    const res = await apiClient.post<ApiResponse<GoodsReceive>>(
      '/inventory/goods-receive',
      data,
    );
    return res.data!;
  }

  async delete(id: string): Promise<ApiResponse<void>> {
    return apiClient.delete<ApiResponse<void>>(
      `/inventory/goods-receive/${id}`,
    );
  }

  async generateReceiveNumber(): Promise<string> {
    const res = await apiClient.get<ApiResponse<{ receiveNumber: string }>>(
      '/inventory/goods-receive/generate-receive-number',
    );
    return res.data!.receiveNumber;
  }
}

export const goodsReceiveService = new GoodsReceiveService();
