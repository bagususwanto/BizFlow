import {
  CreateStockOpnameValues,
  UpdateStockOpnameItemsValues,
  FinalizeStockOpnameValues,
  CancelStockOpnameValues,
  QueryStockOpnamesValues,
  ApiResponse,
  StockOpname,
} from '@bizflow/types';
import { apiClient } from '@/lib/fetch-client';
import { buildSearchParams } from '@/lib/utils';

export interface StockOpnameListResponse {
  data: StockOpname[];
  meta: {
    page: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
  };
  summary: {
    total: number;
    in_progress: number;
    finalized: number;
    cancelled: number;
  };
}

export interface StockOpnameItemDetail {
  id: string;
  opnameId: string;
  variantId: string;
  systemQty: number | string;
  countedQty: number | string | null;
  differenceQty: number | string | null;
  notes?: string | null;
  variant?: {
    id: string;
    sku: string;
    product?: {
      id: string;
      name: string;
    };
  };
}

export interface StockOpnameDetail
  extends Omit<
    StockOpname,
    | 'items'
    | 'finalizedBy'
    | 'cancelledBy'
    | 'creator'
    | 'warehouse'
    | 'category'
  > {
  creator?: {
    id: string;
    name: string;
  };
  finalizedBy?: {
    id: string;
    name: string;
  };
  cancelledBy?: {
    id: string;
    name: string;
  };
  warehouse?: {
    id: string;
    name: string;
  };
  category?: {
    id: string;
    name: string;
  };
  items?: StockOpnameItemDetail[];
}

class StockOpnamesService {
  async getAll(
    params?: QueryStockOpnamesValues,
  ): Promise<StockOpnameListResponse> {
    const searchParams = buildSearchParams(params || {});
    return apiClient.get<StockOpnameListResponse>(
      `/inventory/opname?${searchParams.toString()}`,
    );
  }

  async getById(id: string): Promise<StockOpnameDetail> {
    const res = await apiClient.get<ApiResponse<StockOpnameDetail>>(
      `/inventory/opname/${id}`,
    );
    return res.data!;
  }

  async create(data: CreateStockOpnameValues): Promise<StockOpname> {
    const res = await apiClient.post<ApiResponse<StockOpname>>(
      '/inventory/opname',
      data,
    );
    return res.data!;
  }

  async updateItems(
    id: string,
    data: UpdateStockOpnameItemsValues,
  ): Promise<StockOpname> {
    const res = await apiClient.patch<ApiResponse<StockOpname>>(
      `/inventory/opname/${id}/items`,
      data,
    );
    return res.data!;
  }

  async finalize(
    id: string,
    data: FinalizeStockOpnameValues,
  ): Promise<StockOpname> {
    const res = await apiClient.patch<ApiResponse<StockOpname>>(
      `/inventory/opname/${id}/finalize`,
      data,
    );
    return res.data!;
  }

  async cancel(
    id: string,
    data: CancelStockOpnameValues,
  ): Promise<StockOpname> {
    const res = await apiClient.patch<ApiResponse<StockOpname>>(
      `/inventory/opname/${id}/cancel`,
      data,
    );
    return res.data!;
  }

  async delete(id: string): Promise<ApiResponse<void>> {
    return apiClient.delete<ApiResponse<void>>(`/inventory/opname/${id}`);
  }

  async bulkDelete(ids: string[]): Promise<ApiResponse<void>> {
    return apiClient.post<ApiResponse<void>>('/inventory/opname/bulk-delete', {
      ids,
    });
  }

  async generateOpnameNumber(): Promise<string> {
    const res = await apiClient.get<ApiResponse<{ opnameNumber: string }>>(
      '/inventory/opname/generate-opname-number',
    );
    return res.data!.opnameNumber;
  }
}

export const stockOpnamesService = new StockOpnamesService();
