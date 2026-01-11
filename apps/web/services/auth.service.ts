import type {
  LoginRequest,
  LoginWithPinRequest,
  LoginResponse,
  RefreshTokenRequest,
} from '@bizflow/types';

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1';

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
  private baseUrl: string;

  constructor() {
    this.baseUrl = `${API_BASE_URL}/auth`;
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

  async login(data: LoginRequest): Promise<LoginResponse> {
    const response = await fetch(`${this.baseUrl}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    return this.handleResponse<LoginResponse>(response);
  }

  async pinLogin(data: LoginWithPinRequest): Promise<LoginResponse> {
    const response = await fetch(`${this.baseUrl}/pin-login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    return this.handleResponse<LoginResponse>(response);
  }

  async refresh(refreshToken: string): Promise<RefreshResponse> {
    const response = await fetch(`${this.baseUrl}/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refreshToken } satisfies RefreshTokenRequest),
    });

    return this.handleResponse<RefreshResponse>(response);
  }

  async logout(accessToken: string): Promise<void> {
    await fetch(`${this.baseUrl}/logout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
    });
  }

  async getUsersForPin(): Promise<UserForPin[]> {
    const response = await fetch(`${this.baseUrl}/users-for-pin`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    return this.handleResponse<UserForPin[]>(response);
  }

  async getMe(accessToken: string): Promise<LoginResponse['user']> {
    const response = await fetch(`${this.baseUrl}/me`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
    });

    return this.handleResponse<LoginResponse['user']>(response);
  }
}

export const authService = new AuthService();
