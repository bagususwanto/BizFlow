import {
  CreateWarehouseValues,
  UpdateWarehouseValues,
  Warehouse,
  ApiResponse,
  WarehouseListResponse,
} from '@bizflow/types';
import { apiClient } from '@/lib/fetch-client';
import { buildSearchParams } from '@/lib/utils';

export interface WarehousesQuery {
  page?: number;
  pageSize?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  isActive?: boolean;
}

class WarehousesService {
  async getAll(params?: WarehousesQuery): Promise<WarehouseListResponse> {
    const searchParams = buildSearchParams(params || {});
    return apiClient.get<WarehouseListResponse>(
      `/master-data/warehouses?${searchParams.toString()}`,
    );
  }

  async getById(id: string): Promise<Warehouse> {
    const res = await apiClient.get<ApiResponse<Warehouse>>(
      `/master-data/warehouses/${id}`,
    );
    return res.data!;
  }

  async create(data: CreateWarehouseValues): Promise<Warehouse> {
    const res = await apiClient.post<ApiResponse<Warehouse>>(
      '/master-data/warehouses',
      data,
    );
    return res.data!;
  }

  async update(id: string, data: UpdateWarehouseValues): Promise<Warehouse> {
    const res = await apiClient.patch<ApiResponse<Warehouse>>(
      `/master-data/warehouses/${id}`,
      data,
    );
    return res.data!;
  }

  async delete(id: string): Promise<ApiResponse<void>> {
    return apiClient.delete<ApiResponse<void>>(`/master-data/warehouses/${id}`);
  }

  async bulkDelete(ids: string[]): Promise<ApiResponse<void>> {
    return apiClient.post<ApiResponse<void>>(
      '/master-data/warehouses/bulk-delete',
      {
        ids,
      },
    );
  }

  async getActiveList(): Promise<Warehouse[]> {
    const res = await apiClient.get<ApiResponse<Warehouse[]>>(
      '/master-data/warehouses/list/active',
    );
    return res.data!;
  }

  async generateCode(): Promise<string> {
    const res = await apiClient.get<ApiResponse<{ code: string }>>(
      '/master-data/warehouses/generate-code',
    );
    return res.data!.code;
  }
}

export const warehousesService = new WarehousesService();
