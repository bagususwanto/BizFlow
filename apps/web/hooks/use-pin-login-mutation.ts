import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { authService } from '@/services/auth.service';
import { useAuthStore } from '@/stores/auth.store';
import type { LoginWithPinRequest, LoginResponse } from '@bizflow/types';

export function usePinLoginMutation() {
  const router = useRouter();
  const { setCredentials } = useAuthStore();

  return useMutation({
    mutationFn: (data: LoginWithPinRequest) => authService.pinLogin(data),
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
