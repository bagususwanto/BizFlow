import {
  ApiResponse,
  ApiError,
  CreateRoleValues,
  UpdateRoleValues,
} from '@bizflow/types';

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1';

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
  private baseUrl: string;

  constructor() {
    this.baseUrl = `${API_BASE_URL}/roles`;
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      const error = await response.json().catch(() => ({
        message: 'Terjadi kesalahan pada server',
        statusCode: response.status,
      }));
      throw new Error(error.message);
    }
    return response.json();
  }

  async getAll(token: string): Promise<Role[]> {
    const response = await fetch(this.baseUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });

    return this.handleResponse<Role[]>(response);
  }

  async getPermissions(token: string): Promise<PermissionData> {
    const response = await fetch(`${this.baseUrl}/permissions`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });

    return this.handleResponse<PermissionData>(response);
  }

  async getById(id: string, token: string): Promise<Role> {
    const response = await fetch(`${this.baseUrl}/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });

    return this.handleResponse<Role>(response);
  }

  async create(data: CreateRoleValues, token: string): Promise<Role> {
    const response = await fetch(this.baseUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });

    return this.handleResponse<Role>(response);
  }

  async update(
    id: string,
    data: UpdateRoleValues,
    token: string,
  ): Promise<Role> {
    const response = await fetch(`${this.baseUrl}/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });

    return this.handleResponse<Role>(response);
  }

  async delete(id: string, token: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });

    return this.handleResponse<void>(response);
  }
}

export const rolesService = new RolesService();
