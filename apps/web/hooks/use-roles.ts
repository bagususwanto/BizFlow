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
      if (!token) throw new Error('Unauthorized');
      return rolesService.getAll(token);
    },
    enabled: !!token,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => {
      if (!token) throw new Error('Unauthorized');
      return rolesService.delete(id, token);
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
