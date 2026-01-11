'use client';

import { useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';

import { authService } from '@/services/auth.service';
import { useAuthStore } from '@/stores/auth.store';

export function useAuth() {
  const router = useRouter();
  const {
    user,
    accessToken,
    refreshToken,
    expiresAt,
    isAuthenticated,
    isLoading,
    error,
    setCredentials,
    setTokens,
    logout: storeLogout,
    setLoading,
    setError,
    hasPermission,
  } = useAuthStore();

  // Check if token is expired
  const isTokenExpired = useCallback(() => {
    if (!expiresAt) return true;
    // Add 1 minute buffer before expiry
    return Date.now() > expiresAt - 60000;
  }, [expiresAt]);

  // Refresh token
  const refreshSession = useCallback(async () => {
    if (!refreshToken) {
      storeLogout();
      return false;
    }

    try {
      const response = await authService.refresh(refreshToken);
      setTokens({
        accessToken: response.accessToken,
        refreshToken: response.refreshToken,
        expiresIn: response.expiresIn,
      });
      return true;
    } catch {
      storeLogout();
      return false;
    }
  }, [refreshToken, setTokens, storeLogout]);

  // Logout
  const logout = useCallback(async () => {
    try {
      if (accessToken) {
        await authService.logout();
      }
    } catch {
      // Ignore logout errors
    } finally {
      storeLogout();
      router.push('/login');
    }
  }, [accessToken, storeLogout, router]);

  // Auto refresh token before expiry
  useEffect(() => {
    if (!isAuthenticated || !expiresAt) return;

    const timeUntilExpiry = expiresAt - Date.now() - 60000; // 1 minute before expiry
    if (timeUntilExpiry <= 0) {
      refreshSession();
      return;
    }

    const timeoutId = setTimeout(() => {
      refreshSession();
    }, timeUntilExpiry);

    return () => clearTimeout(timeoutId);
  }, [isAuthenticated, expiresAt, refreshSession]);

  // Require authentication - redirect to login if not authenticated
  const requireAuth = useCallback(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return false;
    }
    return true;
  }, [isAuthenticated, router]);

  return {
    user,
    accessToken,
    isAuthenticated,
    isLoading,
    error,
    isTokenExpired,
    refreshSession,
    logout,
    requireAuth,
    hasPermission,
    setLoading,
    setError,
    setCredentials,
  };
}
