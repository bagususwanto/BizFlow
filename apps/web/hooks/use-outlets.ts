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
    onSuccess: (response) => {
      const message =
        (response as any).data?.message ||
        'Outlet berhasil dinonaktifkan/dihapus';
      toast.success(message);
      queryClient.invalidateQueries({ queryKey: ['outlets'] });
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const bulkDeleteMutation = useMutation({
    mutationFn: (ids: string[]) => outletsService.bulkDelete(ids),
    onSuccess: (response) => {
      const message =
        (response as any).data?.message || 'Outlet berhasil dinonaktifkan';
      toast.success(message);
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

export function useGenerateOutletCode() {
  return useQuery({
    queryKey: ['outlets', 'generate-code'],
    queryFn: () => outletsService.generateCode(),
    enabled: false, // Only run when manually triggered
  });
}

export function useCreateOutlet() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: any) => outletsService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['outlets'] });
      toast.success('Outlet berhasil dibuat');
    },
    onError: (error: any) => {
      toast.error(error instanceof Error ? error.message : 'Terjadi kesalahan');
    },
  });
}

export function useUpdateOutlet(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: any) => outletsService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['outlets'] });
      toast.success('Outlet berhasil diperbarui');
    },
    onError: (error: any) => {
      toast.error(error instanceof Error ? error.message : 'Terjadi kesalahan');
    },
  });
}
