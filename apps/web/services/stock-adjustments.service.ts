import {
  CreateStockAdjustmentValues,
  UpdateStockAdjustmentValues,
  UpdateStockAdjustmentStatusValues,
  QueryStockAdjustmentsValues,
  ApiResponse,
  StockAdjustment,
} from '@bizflow/types';
import { apiClient } from '@/lib/fetch-client';
import { buildSearchParams } from '@/lib/utils';

export interface StockAdjustmentListResponse {
  data: StockAdjustment[];
  meta: {
    page: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
  };
  summary: {
    totalAdjustments: number;
    draftAdjustments: number;
    pendingAdjustments: number;
    approvedAdjustments: number;
    rejectedAdjustments: number;
  };
}

export interface StockAdjustmentItemDetail {
  id: string;
  adjustmentId: string;
  variantId: string;
  systemQty: number | string;
  adjustmentQty: number | string;
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

export interface StockAdjustmentDetail
  extends Omit<StockAdjustment, 'warehouse' | 'items' | 'approvedAt'> {
  statusNotes?: string;
  approvedAt?: string | Date;
  creator?: {
    id: string;
    name: string;
  };
  approver?: {
    id: string;
    name: string;
  };
  warehouse?: {
    id: string;
    name: string;
  };
  items?: StockAdjustmentItemDetail[];
}

class StockAdjustmentsService {
  async getAll(
    params?: QueryStockAdjustmentsValues,
  ): Promise<StockAdjustmentListResponse> {
    const searchParams = buildSearchParams(params || {});
    return apiClient.get<StockAdjustmentListResponse>(
      `/inventory/adjustments?${searchParams.toString()}`,
    );
  }

  async getById(id: string): Promise<StockAdjustmentDetail> {
    const res = await apiClient.get<ApiResponse<StockAdjustmentDetail>>(
      `/inventory/adjustments/${id}`,
    );
    return res.data!;
  }

  async create(data: CreateStockAdjustmentValues): Promise<StockAdjustment> {
    const res = await apiClient.post<ApiResponse<StockAdjustment>>(
      '/inventory/adjustments',
      data,
    );
    return res.data!;
  }

  async update(
    id: string,
    data: UpdateStockAdjustmentValues,
  ): Promise<StockAdjustment> {
    const res = await apiClient.patch<ApiResponse<StockAdjustment>>(
      `/inventory/adjustments/${id}`,
      data,
    );
    return res.data!;
  }

  async updateStatus(
    id: string,
    data: UpdateStockAdjustmentStatusValues,
  ): Promise<StockAdjustment> {
    const res = await apiClient.patch<ApiResponse<StockAdjustment>>(
      `/inventory/adjustments/${id}/status`,
      data,
    );
    return res.data!;
  }

  async delete(id: string): Promise<ApiResponse<void>> {
    return apiClient.delete<ApiResponse<void>>(`/inventory/adjustments/${id}`);
  }

  async bulkDelete(ids: string[]): Promise<ApiResponse<void>> {
    return apiClient.post<ApiResponse<void>>(
      '/inventory/adjustments/bulk-delete',
      {
        ids,
      },
    );
  }

  async generateAdjustmentNumber(): Promise<string> {
    const res = await apiClient.get<ApiResponse<{ adjustmentNumber: string }>>(
      '/inventory/adjustments/generate-adjustment-number',
    );
    return res.data!.adjustmentNumber;
  }
}

export const stockAdjustmentsService = new StockAdjustmentsService();
