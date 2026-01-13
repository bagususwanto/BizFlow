import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { authService } from '@/services/auth.service';
import { useAuthStore } from '@/stores/auth.store';
import type { LoginRequest, LoginResponse } from '@bizflow/types';

export function useLoginMutation() {
  const router = useRouter();
  const { setCredentials } = useAuthStore();

  return useMutation({
    mutationFn: (data: LoginRequest) => authService.login(data),
    onSuccess: (response: LoginResponse) => {
      setCredentials({
        user: response.user,
        accessToken: response.accessToken,
        refreshToken: response.refreshToken,
        expiresIn: response.expiresIn,
      });
      router.push('/dashboard');
    },
  });
}

export function useLogoutMutation() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { logout, accessToken } = useAuthStore();

  return useMutation({
    mutationFn: async () => {
      if (accessToken) {
        await authService.logout();
      }
    },
    onSuccess: () => {
      logout();
      queryClient.clear(); // Clear all queries
      router.push('/login');
    },
    onError: (error) => {
      console.error('Logout failed:', error);
      // Force logout even if API call fails
      logout();
      queryClient.clear();
      router.push('/login');
    },
  });
}
