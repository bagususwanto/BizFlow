import { apiClient } from '@/lib/fetch-client';
import { buildSearchParams } from '@/lib/utils';
import {
  ApiResponse,
  QueryStockValuationValues,
} from '@bizflow/types';

export interface StockValuationItem {
  variantId: string;
  sku: string;
  name: string;
  category: string;
  warehouseId: string | null;
  warehouseName: string | null;
  totalQuantity: number;
  averageCost: number;
  totalValue: number;
}

export interface StockValuationResponse {
  data: StockValuationItem[];
  meta: {
    page: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
  };
  summary: {
    totalValue: number;
    totalItems: number;
    totalQuantity: number;
    averageValuePerItem: number;
  };
}

class StockValuationService {
  /**
   * Get stock valuation report
   */
  async getValuation(query: QueryStockValuationValues): Promise<StockValuationResponse> {
    const searchParams = buildSearchParams(query);
    const response = await apiClient.get<ApiResponse<StockValuationResponse>>(
      `/inventory/stock-valuation?${searchParams}`
    );
    return response.data!;
  }
}

export const stockValuationService = new StockValuationService();
