import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { LoginResponse } from '@bizflow/types';

// Re-use the user type from LoginResponse
export type AuthUser = LoginResponse['user'];

interface AuthState {
  user: AuthUser | null;
  accessToken: string | null;
  refreshToken: string | null;
  expiresAt: number | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  language: 'id' | 'en';

  // Actions
  setCredentials: (data: {
    user: AuthUser;
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
  }) => void;
  setTokens: (data: {
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
  }) => void;
  logout: () => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setUser: (user: AuthUser) => void;
  setLanguage: (lang: 'id' | 'en') => void;
  hasPermission: (permission: string) => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      expiresAt: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      language: 'id',

      setCredentials: ({ user, accessToken, refreshToken, expiresIn }) => {
        set({
          user,
          accessToken,
          refreshToken,
          expiresAt: Date.now() + expiresIn * 1000,
          isAuthenticated: true,
          error: null,
        });
      },

      setTokens: ({ accessToken, refreshToken, expiresIn }) => {
        set({
          accessToken,
          refreshToken,
          expiresAt: Date.now() + expiresIn * 1000,
        });
      },

      logout: () => {
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          expiresAt: null,
          isAuthenticated: false,
          error: null,
        });
      },

      setLoading: (loading) => {
        set({ isLoading: loading });
      },

      setError: (error) => {
        set({ error });
      },

      setUser: (user) => {
        set({ user });
      },

      setLanguage: (language: 'id' | 'en') => {
        set({ language });
      },

      hasPermission: (permission: string) => {
        const { user } = get();
        if (!user) return false;

        // Owner has full access
        if (user.role === 'owner') return true;

        // Check specific permission
        return user.permissions.includes(permission);
      },
    }),
    {
      name: 'bizflow-auth',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        expiresAt: state.expiresAt,
        isAuthenticated: state.isAuthenticated,
        language: state.language,
      }),
    },
  ),
);
