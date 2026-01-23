import {
  CreateUserValues,
  UpdateUserValues,
  UsersQuery,
  User,
  ApiResponse,
  AdminResetPasswordValues,
  ChangePinValues,
} from '@bizflow/types';
import { apiClient } from '@/lib/fetch-client';
import { buildSearchParams } from '@/lib/utils';

// Define response type locally or import if available
export interface UserWithUsage extends User {
  usageCount?: number;
}

export interface UsersResponse {
  data: UserWithUsage[];
  meta: {
    page: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
  };
  summary: {
    totalUsers: number;
    activeUsers: number;
    inactiveUsers: number;
  };
}

class UsersService {
  async getAll(params?: UsersQuery): Promise<UsersResponse> {
    const searchParams = buildSearchParams(params || {});
    return apiClient.get<UsersResponse>(
      `/core/users?${searchParams.toString()}`,
    );
  }

  async getById(id: string): Promise<User> {
    const res = await apiClient.get<ApiResponse<User>>(`/core/users/${id}`);
    return res.data!;
  }

  async create(data: CreateUserValues): Promise<User> {
    const res = await apiClient.post<ApiResponse<User>>('/core/users', data);
    return res.data!;
  }

  async update(id: string, data: UpdateUserValues): Promise<User> {
    const res = await apiClient.patch<ApiResponse<User>>(
      `/core/users/${id}`,
      data,
    );
    return res.data!;
  }

  async delete(id: string): Promise<ApiResponse<void>> {
    return apiClient.delete<ApiResponse<void>>(`/core/users/${id}`);
  }

  async resetPassword(
    id: string,
    data: AdminResetPasswordValues,
  ): Promise<void> {
    await apiClient.patch<ApiResponse<void>>(
      `/core/users/${id}/password`,
      data,
    );
  }

  async changePin(id: string, data: ChangePinValues): Promise<void> {
    await apiClient.patch<ApiResponse<void>>(`/core/users/${id}/pin`, data);
  }

  async bulkDelete(ids: string[]): Promise<ApiResponse<void>> {
    return apiClient.post<ApiResponse<void>>('/core/users/bulk-delete', {
      ids,
    });
  }
}

export const usersService = new UsersService();
