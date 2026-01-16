import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { outletsService } from '@/services/outlets.service';
import { useAuthStore } from '@/stores/auth.store';
import { toast } from 'sonner';
import { QueryOutletsValues } from '@bizflow/types';

export function useOutlets(params?: QueryOutletsValues) {
  const token = useAuthStore((state) => state.accessToken);
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['outlets', params],
    queryFn: () => outletsService.getAll(params),
    enabled: !!token,
    placeholderData: (previousData) => previousData,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => outletsService.delete(id),
    onSuccess: () => {
      toast.success('Outlet berhasil dinonaktifkan/dihapus');
      queryClient.invalidateQueries({ queryKey: ['outlets'] });
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const bulkDeleteMutation = useMutation({
    mutationFn: (ids: string[]) => outletsService.bulkDelete(ids),
    onSuccess: (_, variables) => {
      toast.success(`${variables.length} outlet berhasil dinonaktifkan`);
      queryClient.invalidateQueries({ queryKey: ['outlets'] });
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  return {
    outlets: query.data?.data || [],
    meta: query.data?.meta,
    summary: query.data?.summary,
    isLoading: query.isLoading,
    isError: query.isError,
    deleteOutlet: deleteMutation.mutate,
    isDeleting: deleteMutation.isPending,
    bulkDeleteOutlets: bulkDeleteMutation.mutate,
    isBulkDeleting: bulkDeleteMutation.isPending,
    refetch: query.refetch,
  };
}

export function useOutlet(id: string) {
  const token = useAuthStore((state) => state.accessToken);

  return useQuery({
    queryKey: ['outlet', id],
    queryFn: () => outletsService.getById(id),
    enabled: !!token && !!id,
  });
}

export function useActiveOutlets() {
  const token = useAuthStore((state) => state.accessToken);

  return useQuery({
    queryKey: ['outlets', 'active'],
    queryFn: () => outletsService.getActiveList(),
    enabled: !!token,
  });
}
