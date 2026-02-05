import { ApiResponse, PaginatedResponse, Product } from '@bizflow/types';
import { apiClient } from '@/lib/fetch-client';
import { buildSearchParams } from '@/lib/utils';

export interface PosProduct {
  id: string;
  type: string; // 'product' | 'variant'
  productId: string;
  variantId?: string;
  productName: string;
  variantName?: string | null;
  displayName: string;
  name: string;
  sku: string;
  barcode?: string | null;
  price: number;
  costPrice: number;
  stock: number;
  unit: {
    id: string;
    name: string;
    symbol: string;
  };
  category: {
    id: string;
    name: string;
  };
  isService: boolean;
  imageUrl?: string | null;
}

export interface SearchProductsParams {
  query?: string;
  categoryId?: string;
}

export interface CreateTransactionPayload {
  outletId: string;
  items: {
    productId: string;
    variantId: string; // Required by backend
    quantity: number;
    unitPrice: number; // Changed from price to match backend
    note?: string;
    discountPercent?: number;
    discountAmount?: number;
  }[];
  payments: {
    method: string; // 'cash', 'qris', etc.
    amount: number;
    reference?: string;
    accountId: string; // Required by backend
  }[];
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

  getTransaction: async (id: string) => {
    return apiClient.get<ApiResponse<any>>(`/pos/transactions/${id}`);
  },

  getTransactions: async (params: any) => {
    const searchParams = buildSearchParams(params).toString();
    return apiClient.get<ApiResponse<PaginatedResponse<any>>>(
      `/pos/transactions?${searchParams}`,
    );
  },
};
