import { apiClient } from '@/lib/fetch-client';
import { buildSearchParams } from '@/lib/utils';
import { ApiResponse, QueryStockValues } from '@bizflow/types';

export interface StockItem {
  id: string;
  variantId: string;
  warehouseId: string;
  quantity: number;
  reservedQty: number;
  availableQty: number;
  variant: {
    id: string;
    sku: string;
    name: string;
    product: {
      id: string;
      name: string;
      sku: string;
      category: {
        id: string;
        name: string;
      };
      unit: {
        id: string;
        name: string;
        symbol: string;
      };
    };
  };
  warehouse: {
    id: string;
    code: string;
    name: string;
  };
  updatedAt: string;
}

export interface StocksResponse {
  data: StockItem[];
  meta: {
    page: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
  };
  summary: {
    totalStockRecords: number;
    totalWarehouses: number;
    totalVariantsWithStock: number;
  };
}

export interface StockByVariantResponse {
  variantId: string;
  totalQuantity: number;
  totalReserved: number;
  totalAvailable: number;
  warehouses: {
    warehouseId: string;
    warehouse: {
      id: string;
      code: string;
      name: string;
      isActive: boolean;
    };
    quantity: number;
    reservedQty: number;
    availableQty: number;
    updatedAt: string;
  }[];
}

class StockService {
  async getAll(params?: QueryStockValues): Promise<StocksResponse> {
    const searchParams = buildSearchParams(params || {});
    return apiClient.get<StocksResponse>(
      `/inventory/stock?${searchParams.toString()}`,
    );
  }

  async getByVariant(variantId: string): Promise<StockByVariantResponse> {
    const res = await apiClient.get<ApiResponse<StockByVariantResponse>>(
      `/inventory/stock/variant/${variantId}`,
    );
    return res.data!;
  }

  async getByWarehouse(warehouseId: string): Promise<any> {
    const res = await apiClient.get<ApiResponse<any>>(
      `/inventory/stock/warehouse/${warehouseId}`,
    );
    return res.data!;
  }
}

export const stockService = new StockService();
