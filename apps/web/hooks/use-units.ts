import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { unitsService, UnitsQuery } from '@/services/units.service';
import { useAuthStore } from '@/stores/auth.store';
import { toast } from 'sonner';

export function useUnits(params?: UnitsQuery) {
  const token = useAuthStore((state) => state.accessToken);
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['units', params],
    queryFn: () => unitsService.getAll(params),
    enabled: !!token,
    placeholderData: (previousData) => previousData,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => unitsService.delete(id),
    onSuccess: () => {
      toast.success('Satuan berhasil dihapus');
      queryClient.invalidateQueries({ queryKey: ['units'] });
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const bulkDeleteMutation = useMutation({
    mutationFn: (ids: string[]) => unitsService.bulkDelete(ids),
    onSuccess: (_, variables) => {
      toast.success(`${variables.length} satuan berhasil dihapus`);
      queryClient.invalidateQueries({ queryKey: ['units'] });
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  return {
    units: query.data?.data || [],
    meta: query.data?.meta,
    summary: query.data?.summary,
    isLoading: query.isLoading,
    isError: query.isError,
    deleteUnit: deleteMutation.mutate,
    isDeleting: deleteMutation.isPending,
    bulkDeleteUnits: bulkDeleteMutation.mutate,
    isBulkDeleting: bulkDeleteMutation.isPending,
    refetch: query.refetch,
  };
}

export function useUnit(id: string) {
  const token = useAuthStore((state) => state.accessToken);

  return useQuery({
    queryKey: ['unit', id],
    queryFn: () => unitsService.getById(id),
    enabled: !!token && !!id,
  });
}

export function useCreateUnit() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Parameters<typeof unitsService.create>[0]) =>
      unitsService.create(data),
    onSuccess: () => {
      toast.success('Satuan berhasil ditambahkan');
      queryClient.invalidateQueries({ queryKey: ['units'] });
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useUpdateUnit(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Parameters<typeof unitsService.update>[1]) =>
      unitsService.update(id, data),
    onSuccess: () => {
      toast.success('Satuan berhasil diperbarui');
      queryClient.invalidateQueries({ queryKey: ['units'] });
      queryClient.invalidateQueries({ queryKey: ['unit', id] });
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}
