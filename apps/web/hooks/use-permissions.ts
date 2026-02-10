import { useAuthStore } from '@/stores/auth.store';
import { useCallback } from 'react';

export function usePermissions() {
  const user = useAuthStore((state) => state.user);
  const hasPermissionStore = useAuthStore((state) => state.hasPermission);

  const hasPermission = useCallback(
    (permission: string) => {
      return hasPermissionStore(permission);
    },
    [hasPermissionStore],
  );

  return {
    user,
    hasPermission,
    role: user?.role,
  };
}
