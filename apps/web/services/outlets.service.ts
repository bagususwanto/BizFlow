import {
  CreateOutletValues,
  UpdateOutletValues,
  QueryOutletsValues,
  ApiResponse,
} from '@bizflow/types';
import { apiClient } from '@/lib/fetch-client';
import { buildSearchParams } from '@/lib/utils';

// Define response type locally
export interface Outlet {
  id: string;
  code: string;
  name: string;
  address?: string | null;
  phone?: string | null;
  isActive: boolean;
  userCount?: number;
  transactionCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface OutletsResponse {
  data: Outlet[];
  meta: {
    page: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
  };
  summary: {
    totalOutlets: number;
    activeOutlets: number;
    inactiveOutlets: number;
  };
}

class OutletsService {
  async getAll(params?: QueryOutletsValues): Promise<OutletsResponse> {
    const searchParams = buildSearchParams(params || {});
    return apiClient.get<OutletsResponse>(
      `/core/outlets?${searchParams.toString()}`,
    );
  }

  async getActiveList(): Promise<{ id: string; code: string; name: string }[]> {
    const res = await apiClient.get<
      ApiResponse<{ id: string; code: string; name: string }[]>
    >('/core/outlets/list/active');
    return res.data!;
  }

  async getById(id: string): Promise<Outlet> {
    const res = await apiClient.get<ApiResponse<Outlet>>(`/core/outlets/${id}`);
    return res.data!;
  }

  async create(data: CreateOutletValues): Promise<Outlet> {
    const res = await apiClient.post<ApiResponse<Outlet>>(
      '/core/outlets',
      data,
    );
    return res.data!;
  }

  async update(id: string, data: UpdateOutletValues): Promise<Outlet> {
    const res = await apiClient.patch<ApiResponse<Outlet>>(
      `/core/outlets/${id}`,
      data,
    );
    return res.data!;
  }

  async delete(id: string): Promise<ApiResponse<void>> {
    return apiClient.delete<ApiResponse<void>>(`/core/outlets/${id}`);
  }

  async bulkDelete(ids: string[]): Promise<ApiResponse<void>> {
    return apiClient.post<ApiResponse<void>>('/core/outlets/bulk-delete', {
      ids,
    });
  }
}

export const outletsService = new OutletsService();
