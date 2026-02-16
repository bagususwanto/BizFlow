import {
  CreateSupplierValues,
  UpdateSupplierValues,
  Supplier,
  ApiResponse,
  SupplierListResponse,
} from '@bizflow/types';
import { apiClient } from '@/lib/fetch-client';
import { buildSearchParams } from '@/lib/utils';

export interface SuppliersQuery {
  page?: number;
  pageSize?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  isActive?: boolean;
}

class SuppliersService {
  async getAll(params?: SuppliersQuery): Promise<SupplierListResponse> {
    const searchParams = buildSearchParams(params || {});
    return apiClient.get<SupplierListResponse>(
      `/master-data/suppliers?${searchParams.toString()}`,
    );
  }

  async getById(id: string): Promise<Supplier> {
    const res = await apiClient.get<ApiResponse<Supplier>>(
      `/master-data/suppliers/${id}`,
    );
    return res.data!;
  }

  async create(data: CreateSupplierValues): Promise<Supplier> {
    const res = await apiClient.post<ApiResponse<Supplier>>(
      '/master-data/suppliers',
      data,
    );
    return res.data!;
  }

  async update(id: string, data: UpdateSupplierValues): Promise<Supplier> {
    const res = await apiClient.patch<ApiResponse<Supplier>>(
      `/master-data/suppliers/${id}`,
      data,
    );
    return res.data!;
  }

  async delete(id: string): Promise<ApiResponse<void>> {
    return apiClient.delete<ApiResponse<void>>(`/master-data/suppliers/${id}`);
  }

  async bulkDelete(ids: string[]): Promise<ApiResponse<void>> {
    return apiClient.post<ApiResponse<void>>(
      '/master-data/suppliers/bulk-delete',
      {
        ids,
      },
    );
  }

  async getActiveList(): Promise<Supplier[]> {
    const res = await apiClient.get<ApiResponse<Supplier[]>>(
      '/master-data/suppliers/list/active',
    );
    return res.data!;
  }

  async generateCode(): Promise<string> {
    const res = await apiClient.get<ApiResponse<{ code: string }>>(
      '/master-data/suppliers/generate-code',
    );
    return res.data!.code;
  }
}

export const suppliersService = new SuppliersService();
