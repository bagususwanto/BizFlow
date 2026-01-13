import {
  CreateRoleValues,
  UpdateRoleValues,
  RolesQuery,
  RolesResponse,
  Role,
  PermissionData,
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
    return apiClient.get<PermissionData>('/roles/permissions');
  }

  async getById(id: string): Promise<Role> {
    return apiClient.get<Role>(`/roles/${id}`);
  }

  async create(data: CreateRoleValues): Promise<Role> {
    return apiClient.post<Role>('/roles', data);
  }

  async update(id: string, data: UpdateRoleValues): Promise<Role> {
    return apiClient.patch<Role>(`/roles/${id}`, data);
  }

  async delete(id: string): Promise<void> {
    return apiClient.delete<void>(`/roles/${id}`);
  }
}

export const rolesService = new RolesService();
export type { Role, PermissionData };
