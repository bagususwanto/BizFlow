import { apiClient } from '@/lib/fetch-client';
import { buildSearchParams } from '@/lib/utils';
import {
  ApiResponse,
  QueryStockLotsValues,
} from '@bizflow/types';

export interface StockLot {
  id: string;
  variantId: string;
  warehouseId: string;
  lotNumber: string | null;
  initialQuantity: number;
  quantity: number;
  manufacturedAt: string | null;
  expiredAt: string | null;
  status: 'ACTIVE' | 'DEPLETED' | 'EXPIRED' | 'QUARANTINED';
  notes: string | null;
  createdAt: string;
  updatedAt: string;
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
      } | null;
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
}

export interface StockLotsResponse {
  data: StockLot[];
  meta: {
    page: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
  };
  summary: {
    totalLots: number;
    expiringSoon: number;
    expired: number;
  };
}

export interface CreateStockLotDto {
  variantId: string;
  warehouseId: string;
  lotNumber?: string;
  initialQuantity: number;
  manufacturedAt?: string | null;
  expiredAt?: string | null;
  notes?: string | null;
}

export interface UpdateStockLotDto {
  lotNumber?: string;
  manufacturedAt?: string | null;
  expiredAt?: string | null;
  status?: 'ACTIVE' | 'DEPLETED' | 'EXPIRED' | 'QUARANTINED';
  notes?: string | null;
}

class StockLotsService {
  /**
   * Get all stock lots with filtering and pagination
   */
  async getStockLots(query: QueryStockLotsValues): Promise<StockLotsResponse> {
    const searchParams = buildSearchParams(query);
    const response = await apiClient.get<ApiResponse<StockLotsResponse>>(
      `/inventory/lots?${searchParams}`
    );
    return response.data!;
  }

  /**
   * Get a specific stock lot by ID
   */
  async getStockLotById(id: string): Promise<StockLot> {
    const response = await apiClient.get<ApiResponse<StockLot>>(`/inventory/lots/${id}`);
    return response.data!;
  }

  /**
   * Create a new manual stock lot
   */
  async createStockLot(data: CreateStockLotDto): Promise<StockLot> {
    const response = await apiClient.post<ApiResponse<StockLot>>('/inventory/lots', data);
    return response.data!;
  }

  /**
   * Update a stock lot
   */
  async updateStockLot(id: string, data: UpdateStockLotDto): Promise<StockLot> {
    const response = await apiClient.patch<ApiResponse<StockLot>>(`/inventory/lots/${id}`, data);
    return response.data!;
  }
}

export const stockLotsService = new StockLotsService();
