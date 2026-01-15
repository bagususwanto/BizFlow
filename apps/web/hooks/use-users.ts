import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { usersService } from '@/services/users.service';
import { useAuthStore } from '@/stores/auth.store';
import { toast } from 'sonner';
import { UsersQuery } from '@bizflow/types';

export function useUsers(params?: UsersQuery) {
  const token = useAuthStore((state) => state.accessToken);
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['users', params],
    queryFn: () => usersService.getAll(params),
    enabled: !!token,
    placeholderData: (previousData) => previousData,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => usersService.delete(id),
    onSuccess: () => {
      toast.success('User berhasil dinonaktifkan');
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const bulkDeleteMutation = useMutation({
    mutationFn: (ids: string[]) => usersService.bulkDelete(ids),
    onSuccess: (_, variables) => {
      toast.success(`${variables.length} user berhasil dinonaktifkan`);
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  return {
    users: query.data?.data || [],
    meta: query.data?.meta,
    summary: query.data?.summary,
    isLoading: query.isLoading,
    isError: query.isError,
    deleteUser: deleteMutation.mutate,
    isDeleting: deleteMutation.isPending,
    bulkDeleteUsers: bulkDeleteMutation.mutate,
    isBulkDeleting: bulkDeleteMutation.isPending,
    refetch: query.refetch,
  };
}

export function useUser(id: string) {
  const token = useAuthStore((state) => state.accessToken);

  return useQuery({
    queryKey: ['user', id],
    queryFn: () => usersService.getById(id),
    enabled: !!token && !!id,
  });
}
