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

class RolesService {
  async getAll(params?: RolesQuery): Promise<RolesResponse> {
    const searchParams = new URLSearchParams();

    if (params) {
      if (params.page) searchParams.append('page', params.page.toString());
      if (params.pageSize)
        searchParams.append('pageSize', params.pageSize.toString());
      if (params.sortBy) searchParams.append('sortBy', params.sortBy);
      if (params.sortOrder) searchParams.append('sortOrder', params.sortOrder);
      if (params.search) searchParams.append('search', params.search);
      if (params.isSystemRole !== undefined)
        searchParams.append('isSystemRole', String(params.isSystemRole));
    }

    return apiClient.get<RolesResponse>(`/roles?${searchParams.toString()}`);
  }

  async getPermissions(): Promise<PermissionData> {
    const res =
      await apiClient.get<ApiResponse<PermissionData>>('/roles/permissions');
    return res.data!;
  }

  async getById(id: string): Promise<Role> {
    const res = await apiClient.get<ApiResponse<Role>>(`/roles/${id}`);
    return res.data!;
  }

  async create(data: CreateRoleValues): Promise<Role> {
    const res = await apiClient.post<ApiResponse<Role>>('/roles', data);
    return res.data!;
  }

  async update(id: string, data: UpdateRoleValues): Promise<Role> {
    const res = await apiClient.patch<ApiResponse<Role>>(`/roles/${id}`, data);
    return res.data!;
  }

  async delete(id: string): Promise<void> {
    await apiClient.delete<ApiResponse<void>>(`/roles/${id}`);
  }
}

export const rolesService = new RolesService();
export type { Role, PermissionData };
