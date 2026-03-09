import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { authService } from '@/services/auth.service';
import { useAuthStore } from '@/stores/auth.store';
import type { LoginRequest, LoginResponse } from '@bizflow/types';
import { toast } from 'sonner';

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
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useUsersForPinQuery() {
  return useQuery({
    queryKey: ['users-for-pin'],
    queryFn: () => authService.getUsersForPin(),
  });
}
