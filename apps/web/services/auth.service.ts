import type {
  LoginRequest,
  LoginWithPinRequest,
  LoginResponse,
  RefreshTokenRequest,
  UserForPin,
  ApiResponse,
} from '@bizflow/types';
import { apiClient } from '@/lib/fetch-client';

// Re-export types for convenience
export type {
  LoginRequest,
  LoginWithPinRequest,
  LoginResponse,
  RefreshTokenRequest,
};

// Type for refresh response (tokens only)
export type RefreshResponse = Omit<LoginResponse, 'user'>;

class AuthService {
  async login(data: LoginRequest): Promise<LoginResponse> {
    const res = await apiClient.post<ApiResponse<LoginResponse>>(
      '/core/auth/login',
      data,
    );
    return res.data!;
  }

  async pinLogin(data: LoginWithPinRequest): Promise<LoginResponse> {
    const res = await apiClient.post<ApiResponse<LoginResponse>>(
      '/core/auth/pin-login',
      data,
    );
    return res.data!;
  }

  async refresh(refreshToken: string): Promise<RefreshResponse> {
    const res = await apiClient.post<ApiResponse<RefreshResponse>>(
      '/core/auth/refresh',
      {
        refreshToken,
      },
    );
    return res.data!;
  }

  async logout(): Promise<void> {
    await apiClient.post<ApiResponse<void>>('/core/auth/logout', {});
  }

  async getUsersForPin(): Promise<UserForPin[]> {
    const res = await apiClient.get<ApiResponse<UserForPin[]>>(
      '/core/auth/users-for-pin',
    );
    return res.data!;
  }

  async getMe(): Promise<LoginResponse['user']> {
    const res =
      await apiClient.get<ApiResponse<LoginResponse['user']>>('/core/auth/me');
    return res.data!;
  }
}

export const authService = new AuthService();
