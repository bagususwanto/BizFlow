import { apiClient } from '@/lib/fetch-client';
import { buildSearchParams } from '@/lib/utils';
import {
  QueryStockValuationValues,
} from '@bizflow/types';

export interface StockValuationItem {
  id: string;
  variantId: string;
  warehouseId: string;
  avgCost: number;
  totalQty: number;
  totalValue: number;
  updatedAt: string;
  variant: {
    id: string;
    sku: string;
    name: string;
    product: {
      id: string;
      name: string;
      sku: string;
      category: { id: string; name: string } | null;
      unit: { id: string; name: string; symbol: string } | null;
    };
  };
  warehouse: {
    id: string;
    code: string;
    name: string;
  };
}

export interface StockValuationMeta {
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
}

export interface StockValuationSummary {
  totalInventoryValue: number;
  totalVariants: number;
}

export interface StockValuationResponse {
  data: StockValuationItem[];
  meta: StockValuationMeta;
  summary: StockValuationSummary;
}

class StockValuationService {
  /**
   * Get stock valuation report
   */
  async getValuation(query: QueryStockValuationValues): Promise<StockValuationResponse> {
    const searchParams = buildSearchParams(query);
    const response = await apiClient.get<StockValuationResponse>(
      `/inventory/stock-valuation?${searchParams}`
    );
    return response;
  }
}

export const stockValuationService = new StockValuationService();
