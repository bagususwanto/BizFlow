import { ApiResponse } from '@bizflow/types';
import { apiClient } from '@/lib/fetch-client';

export interface CreatePaymentPayload {
  orderId: string;
  accountId: string;
  paymentMethod: string;
  amount: number;
  reference?: string;
  notes?: string;
}

export interface SplitPaymentPayload {
  items: {
    method: string;
    amount: number;
    accountId: string;
    reference?: string;
  }[];
  totalAmount: number;
}

export const posPaymentsService = {
  createPayment: async (data: CreatePaymentPayload) => {
    return apiClient.post<ApiResponse<any>>('/pos/payments', data);
  },

  validateSplit: async (data: SplitPaymentPayload) => {
    return apiClient.post<ApiResponse<any>>(
      '/pos/payments/validate-split',
      data,
    );
  },

  getPayments: async (params: any) => {
    const queryString = new URLSearchParams(params).toString();
    return apiClient.get<ApiResponse<any>>(`/pos/payments?${queryString}`);
  },

  getSummary: async (params: any) => {
    const queryString = new URLSearchParams(params).toString();
    return apiClient.get<ApiResponse<any>>(
      `/pos/payments/summary?${queryString}`,
    );
  },

  getAccounts: async () => {
    return apiClient.get<ApiResponse<any[]>>('/pos/payments/accounts');
  },
};
