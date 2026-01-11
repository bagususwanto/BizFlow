import type {
  LoginRequest,
  LoginWithPinRequest,
  LoginResponse,
  RefreshTokenRequest,
} from '@bizflow/types';
import { apiClient } from '@/lib/fetch-client';

// Re-export types for convenience
export type {
  LoginRequest,
  LoginWithPinRequest,
  LoginResponse,
  RefreshTokenRequest,
};

// Extended type for user in PIN login selection
export interface UserForPin {
  id: string;
  username: string;
  name: string;
}

// Type for refresh response (tokens only)
export type RefreshResponse = Omit<LoginResponse, 'user'>;

class AuthService {
  async login(data: LoginRequest): Promise<LoginResponse> {
    return apiClient.post<LoginResponse>('/auth/login', data);
  }

  async pinLogin(data: LoginWithPinRequest): Promise<LoginResponse> {
    return apiClient.post<LoginResponse>('/auth/pin-login', data);
  }

  async refresh(refreshToken: string): Promise<RefreshResponse> {
    return apiClient.post<RefreshResponse>('/auth/refresh', { refreshToken });
  }

  async logout(): Promise<void> {
    return apiClient.post<void>('/auth/logout', {});
  }

  async getUsersForPin(): Promise<UserForPin[]> {
    return apiClient.get<UserForPin[]>('/auth/users-for-pin');
  }

  async getMe(): Promise<LoginResponse['user']> {
    return apiClient.get<LoginResponse['user']>('/auth/me');
  }
}

export const authService = new AuthService();
