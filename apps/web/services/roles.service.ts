import {
  CreateRoleValues,
  UpdateRoleValues,
  RolesQuery,
  RolesResponse,
  Role,
  PermissionData,
  ApiResponse,
} from '@bizflow/types';
import { apiClient } from '@/lib/fetch-client';
import { buildSearchParams } from '@/lib/utils';

class RolesService {
  async getAll(params?: RolesQuery): Promise<RolesResponse> {
    const searchParams = buildSearchParams(params || {});

    return apiClient.get<RolesResponse>(
      `/core/roles?${searchParams.toString()}`,
    );
  }

  async getPermissions(): Promise<PermissionData> {
    const res = await apiClient.get<ApiResponse<PermissionData>>(
      '/core/roles/permissions',
    );
    return res.data!;
  }

  async getById(id: string): Promise<Role> {
    const res = await apiClient.get<ApiResponse<Role>>(`/core/roles/${id}`);
    return res.data!;
  }

  async create(data: CreateRoleValues): Promise<Role> {
    const res = await apiClient.post<ApiResponse<Role>>('/core/roles', data);
    return res.data!;
  }

  async update(id: string, data: UpdateRoleValues): Promise<Role> {
    const res = await apiClient.patch<ApiResponse<Role>>(
      `/core/roles/${id}`,
      data,
    );
    return res.data!;
  }

  async delete(id: string): Promise<void> {
    await apiClient.delete<ApiResponse<void>>(`/core/roles/${id}`);
  }

  async bulkDelete(ids: string[]): Promise<void> {
    await apiClient.post<ApiResponse<void>>('/core/roles/bulk-delete', { ids });
  }
}

export const rolesService = new RolesService();
export type { Role, PermissionData };
