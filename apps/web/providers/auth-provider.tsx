'use client';

import { useEffect, useCallback } from 'react';
import { useAuthStore } from '@/stores/auth.store';
import { authService } from '@/services/auth.service';
import { settingsService } from '@/services/settings.service';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const {
    refreshToken,
    expiresAt,
    isAuthenticated,
    setTokens,
    setUser,
    logout: storeLogout,
  } = useAuthStore();

  // Refresh token logic
  const refreshSession = useCallback(async () => {
    if (!refreshToken) {
      storeLogout();
      return;
    }

    try {
      const response = await authService.refresh(refreshToken);
      setTokens({
        accessToken: response.accessToken,
        refreshToken: response.refreshToken,
        expiresIn: response.expiresIn,
      });
    } catch {
      storeLogout();
    }
  }, [refreshToken, setTokens, storeLogout]);

  // Rehydrate user data on mount
  useEffect(() => {
    if (!isAuthenticated) return;

    const fetchUserAndSettings = async () => {
      try {
        const [user, languageSetting] = await Promise.allSettled([
          authService.getMe(),
          settingsService.getByKey('language'),
        ]);

        if (user.status === 'fulfilled') {
          setUser(user.value);
        }

        if (languageSetting.status === 'fulfilled' && languageSetting.value) {
          useAuthStore
            .getState()
            .setLanguage(languageSetting.value.value as 'id' | 'en');
        }
      } catch {
        // Ignored. Refresh logic handles 401s.
      }
    };

    fetchUserAndSettings();
  }, [isAuthenticated, setUser]);

  // Auto refresh token before expiry
  useEffect(() => {
    if (!isAuthenticated || !expiresAt) return;

    const timeUntilExpiry = expiresAt - Date.now() - 60000; // 1 minute before expiry

    // If token is about to expire or already expired, refresh immediately
    if (timeUntilExpiry <= 0) {
      refreshSession();
      return;
    }

    // Schedule refresh
    const timeoutId = setTimeout(() => {
      refreshSession();
    }, timeUntilExpiry);

    return () => clearTimeout(timeoutId);
  }, [isAuthenticated, expiresAt, refreshSession]);

  return <>{children}</>;
}
