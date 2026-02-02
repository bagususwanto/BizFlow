import { apiClient } from '@/lib/fetch-client';
import type { ApiResponse, PaginatedResponse } from '@bizflow/types';
import { buildSearchParams } from '@/lib/utils';
// @bizflow/types import assumes path mapping; usually frontend imports from packages directly or just uses type-only usage.
// Assuming we can use generic types or define them.
import type {
  CreateReturnValues,
  QueryReturnsValues,
  ProcessReturnRefundValues,
  ApproveReturnValues,
  RejectReturnValues,
} from '@bizflow/types';

export const posReturnsService = {
  createReturn: async (data: CreateReturnValues) => {
    const response = await apiClient.post<ApiResponse<any>>(
      '/pos/returns',
      data,
    );
    return response.data;
  },

  getReturns: async (params: any) => {
    const searchParams = buildSearchParams(params).toString();
    const response = await apiClient.get<ApiResponse<PaginatedResponse<any>>>(
      `/pos/returns?${searchParams}`,
    );
    return response.data;
  },

  getReturnById: async (id: string) => {
    const response = await apiClient.get<ApiResponse<any>>(
      `/pos/returns/${id}`,
    );
    return response.data;
  },

  approveReturn: async (id: string, data?: ApproveReturnValues) => {
    const response = await apiClient.post<ApiResponse<any>>(
      `/pos/returns/${id}/approve`,
      data || {},
    );
    return response.data;
  },

  rejectReturn: async (id: string, data: RejectReturnValues) => {
    const response = await apiClient.post<ApiResponse<any>>(
      `/pos/returns/${id}/reject`,
      data,
    );
    return response.data;
  },

  processRefund: async (id: string, data: ProcessReturnRefundValues) => {
    const response = await apiClient.post<ApiResponse<any>>(
      `/pos/returns/${id}/refund`,
      data,
    );
    return response.data;
  },
};
