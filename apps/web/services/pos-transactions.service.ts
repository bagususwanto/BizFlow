import { ApiResponse, PaginatedResponse, Product } from '@bizflow/types';
import { apiClient } from '@/lib/fetch-client';

export interface PosProduct extends Omit<Product, 'sellPrice' | 'costPrice'> {
  stock?: number;
  sellPrice: number;
  costPrice: number;
}

export interface SearchProductsParams {
  query?: string;
  categoryId?: string;
}

export interface CreateTransactionPayload {
  items: {
    productId: string;
    variantId?: string;
    quantity: number;
    price: number;
    note?: string;
  }[];
  payment?: {
    method: string; // 'cash', 'qris', etc.
    amount: number;
    reference?: string;
  };
  customerId?: string;
  notes?: string;
}

export const posTransactionsService = {
  searchProducts: async (params: SearchProductsParams) => {
    return apiClient.post<ApiResponse<PosProduct[]>>(
      '/pos/transactions/search-products',
      params,
    );
  },

  createTransaction: async (data: CreateTransactionPayload) => {
    return apiClient.post<ApiResponse<any>>('/pos/transactions', data);
  },

  holdTransaction: async (data: any) => {
    return apiClient.post<ApiResponse<any>>('/pos/transactions/hold', data);
  },

  getHeldTransactions: async () => {
    return apiClient.get<ApiResponse<any[]>>('/pos/transactions/held/list');
  },

  resumeHeldTransaction: async (id: string) => {
    return apiClient.post<ApiResponse<any>>(
      `/pos/transactions/held/${id}/resume`,
      {},
    );
  },

  deleteHeldTransaction: async (id: string) => {
    return apiClient.delete<ApiResponse<any>>(`/pos/transactions/held/${id}`);
  },
};
