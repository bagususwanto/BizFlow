import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { rolesService } from '@/services/roles.service';
import { useAuthStore } from '@/stores/auth.store';
import { toast } from 'sonner';
import { RolesQuery } from '@bizflow/types';

export function useRoles(params?: RolesQuery) {
  const token = useAuthStore((state) => state.accessToken);
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['roles', params],
    queryFn: () => {
      return rolesService.getAll(params);
    },
    enabled: !!token,
    placeholderData: (previousData) => previousData,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => {
      return rolesService.delete(id);
    },
    onSuccess: (response) => {
      const message =
        (response as any).data?.message || 'Role berhasil dihapus';
      toast.success(message);
      queryClient.invalidateQueries({ queryKey: ['roles'] });
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  return {
    roles: query.data?.data || [],
    meta: query.data?.meta,
    summary: query.data?.summary,
    isLoading: query.isLoading,
    isError: query.isError,
    deleteRole: deleteMutation.mutate,
    isDeleting: deleteMutation.isPending,
    refetch: query.refetch,
  };
}
