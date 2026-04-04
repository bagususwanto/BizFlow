import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { suppliersService, SuppliersQuery } from '@/services/suppliers.service';
import { useAuthStore } from '@/stores/auth.store';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';

export function useSuppliers(params?: SuppliersQuery) {
  const token = useAuthStore((state) => state.accessToken);
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['suppliers', params],
    queryFn: () => suppliersService.getAll(params),
    enabled: !!token,
    placeholderData: (previousData) => previousData,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => suppliersService.delete(id),
    onSuccess: (response) => {
      const message =
        (response as any).data?.message || 'Supplier berhasil dihapus';
      toast.success(message);
      queryClient.invalidateQueries({ queryKey: ['suppliers'] });
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const bulkDeleteMutation = useMutation({
    mutationFn: (ids: string[]) => suppliersService.bulkDelete(ids),
    onSuccess: (response) => {
      const message =
        (response as any).data?.message || 'Supplier berhasil dihapus';
      toast.success(message);
      queryClient.invalidateQueries({ queryKey: ['suppliers'] });
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  return {
    suppliers: query.data?.data || [],
    meta: query.data?.meta,
    summary: query.data?.summary,
    isLoading: query.isLoading,
    isError: query.isError,
    deleteSupplier: deleteMutation.mutate,
    isDeleting: deleteMutation.isPending,
    bulkDeleteSuppliers: bulkDeleteMutation.mutate,
    isBulkDeleting: bulkDeleteMutation.isPending,
    refetch: query.refetch,
  };
}

export function useSupplier(id: string) {
  const token = useAuthStore((state) => state.accessToken);

  return useQuery({
    queryKey: ['supplier', id],
    queryFn: () => suppliersService.getById(id),
    enabled: !!token && !!id,
  });
}

export function useCreateSupplier() {
  const queryClient = useQueryClient();
  const t = useTranslations('suppliers.form.messages');

  return useMutation({
    mutationFn: (data: Parameters<typeof suppliersService.create>[0]) =>
      suppliersService.create(data),
    onSuccess: async (response) => {
      const message = (response as any).data?.message || t('createSuccess');
      await queryClient.invalidateQueries({ queryKey: ['suppliers'] });
      toast.success(message);
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useUpdateSupplier(id: string) {
  const queryClient = useQueryClient();
  const t = useTranslations('suppliers.form.messages');

  return useMutation({
    mutationFn: (data: Parameters<typeof suppliersService.update>[1]) =>
      suppliersService.update(id, data),
    onSuccess: async (response) => {
      const message = (response as any).data?.message || t('updateSuccess');
      await queryClient.invalidateQueries({ queryKey: ['suppliers'] });
      await queryClient.invalidateQueries({ queryKey: ['supplier', id] });
      toast.success(message);
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useActiveSuppliers() {
  const token = useAuthStore((state) => state.accessToken);

  return useQuery({
    queryKey: ['suppliers', 'active'],
    queryFn: () => suppliersService.getActiveList(),
    enabled: !!token,
  });
}

export function useGenerateSupplierCode() {
  const token = useAuthStore((state) => state.accessToken);

  return useQuery({
    queryKey: ['supplier', 'generate-code'],
    queryFn: () => suppliersService.generateCode(),
    enabled: !!token,
    staleTime: 0,
  });
}
