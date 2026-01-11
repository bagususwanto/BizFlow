import {
  ApiResponse,
  ApiError,
  CreateRoleValues,
  UpdateRoleValues,
} from '@bizflow/types';
import { apiClient } from '@/lib/fetch-client';

export interface Role {
  id: string;
  name: string;
  description?: string;
  permissions: {
    module: string;
    action: string;
  }[];
  userCount: number;
  isSystemRole: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PermissionNode {
  module: string;
  action: string;
  description: string;
}

export interface PermissionData {
  modules: string[];
  actions: string[];
  permissions: PermissionNode[];
}

class RolesService {
  async getAll(token?: string): Promise<Role[]> {
    return apiClient.get<Role[]>('/roles');
  }

  async getPermissions(token?: string): Promise<PermissionData> {
    return apiClient.get<PermissionData>('/roles/permissions');
  }

  async getById(id: string, token?: string): Promise<Role> {
    return apiClient.get<Role>(`/roles/${id}`);
  }

  async create(data: CreateRoleValues, token?: string): Promise<Role> {
    return apiClient.post<Role>('/roles', data);
  }

  async update(
    id: string,
    data: UpdateRoleValues,
    token?: string,
  ): Promise<Role> {
    return apiClient.patch<Role>(`/roles/${id}`, data);
  }

  async delete(id: string, token?: string): Promise<void> {
    return apiClient.delete<void>(`/roles/${id}`);
  }
}

export const rolesService = new RolesService();
