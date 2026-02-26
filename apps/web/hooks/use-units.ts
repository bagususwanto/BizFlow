import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { unitsService, UnitsQuery } from '@/services/units.service';
import { useAuthStore } from '@/stores/auth.store';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';

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
    onSuccess: (response) => {
      const message =
        (response as any).data?.message || 'Satuan berhasil dihapus';
      toast.success(message);
      queryClient.invalidateQueries({ queryKey: ['units'] });
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const bulkDeleteMutation = useMutation({
    mutationFn: (ids: string[]) => unitsService.bulkDelete(ids),
    onSuccess: (response) => {
      const message =
        (response as any).data?.message || 'Satuan berhasil dihapus';
      toast.success(message);
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
  const t = useTranslations('units.form.messages');

  return useMutation({
    mutationFn: (data: Parameters<typeof unitsService.create>[0]) =>
      unitsService.create(data),
    onSuccess: () => {
      toast.success(t('createSuccess'));
      queryClient.invalidateQueries({ queryKey: ['units'] });
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useUpdateUnit(id: string) {
  const queryClient = useQueryClient();
  const t = useTranslations('units.form.messages');

  return useMutation({
    mutationFn: (data: Parameters<typeof unitsService.update>[1]) =>
      unitsService.update(id, data),
    onSuccess: () => {
      toast.success(t('updateSuccess'));
      queryClient.invalidateQueries({ queryKey: ['units'] });
      queryClient.invalidateQueries({ queryKey: ['unit', id] });
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useActiveUnits() {
  const token = useAuthStore((state) => state.accessToken);

  return useQuery({
    queryKey: ['units', 'active'],
    queryFn: () => unitsService.getActiveList(),
    enabled: !!token,
  });
}
