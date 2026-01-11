import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { rolesService } from '@/services/roles.service';
import { useAuthStore } from '@/stores/auth.store';
import { toast } from 'sonner';

export function useRoles() {
  const token = useAuthStore((state) => state.accessToken);
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['roles'],
    queryFn: () => {
      // FetchClient handles token automatically
      return rolesService.getAll();
    },
    enabled: !!token, // Keep enabled check if we want to wait for auth
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => {
      return rolesService.delete(id);
    },
    onSuccess: () => {
      toast.success('Role berhasil dihapus');
      queryClient.invalidateQueries({ queryKey: ['roles'] });
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  return {
    roles: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    deleteRole: deleteMutation.mutate,
    isDeleting: deleteMutation.isPending,
    refetch: query.refetch,
  };
}
