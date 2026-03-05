import {
  CreateStockTransferValues,
  UpdateStockTransferValues,
  UpdateStockTransferStatusValues,
  QueryStockTransfersValues,
  ApiResponse,
  StockTransfer,
} from '@bizflow/types';
import { apiClient } from '@/lib/fetch-client';
import { buildSearchParams } from '@/lib/utils';

export interface StockTransferListResponse {
  data: StockTransfer[];
  meta: {
    page: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
  };
  summary: {
    total: number;
    draft: number;
    sent: number;
    received: number;
    cancelled: number;
  };
}

export interface StockTransferItemDetail {
  id: string;
  transferId: string;
  variantId: string;
  requestedQty: number | string;
  sentQty: number | string;
  receivedQty: number | string;
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

export interface StockTransferDetail
  extends Omit<
    StockTransfer,
    'fromWarehouse' | 'toWarehouse' | 'items' | 'sentAt' | 'receivedAt'
  > {
  sentAt?: string | Date;
  receivedAt?: string | Date;
  creator?: {
    id: string;
    name: string;
  };
  sender?: {
    id: string;
    name: string;
  };
  receiver?: {
    id: string;
    name: string;
  };
  fromWarehouse?: {
    id: string;
    name: string;
  };
  toWarehouse?: {
    id: string;
    name: string;
  };
  items?: StockTransferItemDetail[];
}

class StockTransfersService {
  async getAll(
    params?: QueryStockTransfersValues,
  ): Promise<StockTransferListResponse> {
    const searchParams = buildSearchParams(params || {});
    return apiClient.get<StockTransferListResponse>(
      `/inventory/transfers?${searchParams.toString()}`,
    );
  }

  async getById(id: string): Promise<StockTransferDetail> {
    const res = await apiClient.get<ApiResponse<StockTransferDetail>>(
      `/inventory/transfers/${id}`,
    );
    return res.data!;
  }

  async create(data: CreateStockTransferValues): Promise<StockTransfer> {
    const res = await apiClient.post<ApiResponse<StockTransfer>>(
      '/inventory/transfers',
      data,
    );
    return res.data!;
  }

  async update(
    id: string,
    data: UpdateStockTransferValues,
  ): Promise<StockTransfer> {
    const res = await apiClient.patch<ApiResponse<StockTransfer>>(
      `/inventory/transfers/${id}`,
      data,
    );
    return res.data!;
  }

  async updateStatus(
    id: string,
    data: UpdateStockTransferStatusValues,
  ): Promise<StockTransfer> {
    const res = await apiClient.patch<ApiResponse<StockTransfer>>(
      `/inventory/transfers/${id}/status`,
      data,
    );
    return res.data!;
  }

  async delete(id: string): Promise<ApiResponse<void>> {
    return apiClient.delete<ApiResponse<void>>(`/inventory/transfers/${id}`);
  }

  async bulkDelete(ids: string[]): Promise<ApiResponse<void>> {
    return apiClient.post<ApiResponse<void>>(
      '/inventory/transfers/bulk-delete',
      {
        ids,
      },
    );
  }

  async generateTransferNumber(): Promise<string> {
    const res = await apiClient.get<ApiResponse<{ transferNumber: string }>>(
      '/inventory/transfers/generate-transfer-number',
    );
    return res.data!.transferNumber;
  }
}

export const stockTransfersService = new StockTransfersService();
