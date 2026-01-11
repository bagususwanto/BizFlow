'use client';

import { useEffect, useCallback } from 'react';
import { useAuthStore } from '@/stores/auth.store';
import { authService } from '@/services/auth.service';

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

    const fetchUser = async () => {
      try {
        const user = await authService.getMe();
        setUser(user);
      } catch {
        // If we can't fetch user (likely 401), we should probably logout
        // But let the refresh logic handle 401s if token is expired
        // Here we just ignore or log error
        // Actually, if getMe fails, it implies session is invalid if token was supposed to be valid
        // But let's be safe and not aggressive logout here unless we are sure
      }
    };

    fetchUser();
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
