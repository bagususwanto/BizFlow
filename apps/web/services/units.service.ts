import {
  CreateUnitValues,
  UpdateUnitValues,
  UnitOfMeasure,
  ApiResponse,
  UnitListResponse,
} from '@bizflow/types';
import { apiClient } from '@/lib/fetch-client';
import { buildSearchParams } from '@/lib/utils';

export interface UnitsQuery {
  page?: number;
  pageSize?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  baseUnitId?: string;
}

class UnitsService {
  async getAll(params?: UnitsQuery): Promise<UnitListResponse> {
    const searchParams = buildSearchParams(params || {});
    return apiClient.get<UnitListResponse>(
      `/master-data/units?${searchParams.toString()}`,
    );
  }

  async getById(id: string): Promise<UnitOfMeasure> {
    const res = await apiClient.get<ApiResponse<UnitOfMeasure>>(
      `/master-data/units/${id}`,
    );
    return res.data!;
  }

  async create(data: CreateUnitValues): Promise<UnitOfMeasure> {
    const res = await apiClient.post<ApiResponse<UnitOfMeasure>>(
      '/master-data/units',
      data,
    );
    return res.data!;
  }

  async update(id: string, data: UpdateUnitValues): Promise<UnitOfMeasure> {
    const res = await apiClient.patch<ApiResponse<UnitOfMeasure>>(
      `/master-data/units/${id}`,
      data,
    );
    return res.data!;
  }

  async delete(id: string): Promise<void> {
    await apiClient.delete<ApiResponse<void>>(`/master-data/units/${id}`);
  }

  async bulkDelete(ids: string[]): Promise<void> {
    await apiClient.post<ApiResponse<void>>('/master-data/units/bulk-delete', {
      ids,
    });
  }

  async getActiveList(): Promise<
    { id: string; name: string; symbol: string }[]
  > {
    // For now getting all units since we don't have specific active list endpoint yet
    // filtering client side if needed, or update backend later
    const res = await this.getAll({ pageSize: 100 });
    return res.data!.map((u) => ({ id: u.id, name: u.name, symbol: u.symbol }));
  }
}

export const unitsService = new UnitsService();
