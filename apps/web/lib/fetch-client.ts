import { ApiError } from '@bizflow/types';
import { useAuthStore } from '@/stores/auth.store';

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1';

type FetchOptions = RequestInit & {
  headers?: Record<string, string>;
};

class FetchClient {
  private async request<T>(
    endpoint: string,
    options: FetchOptions = {},
  ): Promise<T> {
    const { accessToken } = useAuthStore.getState();

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (accessToken) {
      headers['Authorization'] = `Bearer ${accessToken}`;
    }

    const config: RequestInit = {
      ...options,
      headers,
    };

    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      // Handle ApiError struct
      if (data?.error?.message) {
        throw new Error(data.error.message);
      }

      // Fallback
      throw new Error(data.message || 'Terjadi kesalahan pada server');
    }

    // Handle 204 No Content
    if (response.status === 204) {
      return {} as T;
    }

    // If API returns standardized wrapper, validation check
    if (
      data &&
      typeof data === 'object' &&
      'success' in data &&
      'error' in data
    ) {
      if (!data.success) {
        throw new Error(data.error?.message || 'Unknown API error');
      }
    }

    return data as T;
  }

  async get<T>(endpoint: string, options?: FetchOptions): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'GET' });
  }

  async post<T>(
    endpoint: string,
    body: any,
    options?: FetchOptions,
  ): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: JSON.stringify(body),
    });
  }

  async put<T>(
    endpoint: string,
    body: any,
    options?: FetchOptions,
  ): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: JSON.stringify(body),
    });
  }

  async patch<T>(
    endpoint: string,
    body: any,
    options?: FetchOptions,
  ): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PATCH',
      body: JSON.stringify(body),
    });
  }

  async delete<T>(endpoint: string, options?: FetchOptions): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'DELETE' });
  }

  async getBlob(endpoint: string, options?: FetchOptions): Promise<Blob> {
    const { accessToken } = useAuthStore.getState();

    const headers: Record<string, string> = {
      ...(options?.headers as Record<string, string>),
    };

    if (accessToken) {
      headers['Authorization'] = `Bearer ${accessToken}`;
    }

    const config: RequestInit = {
      ...options,
      headers,
      method: 'GET',
    };

    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Gagal mengunduh file');
    }

    return response.blob();
  }
}

export const apiClient = new FetchClient();
