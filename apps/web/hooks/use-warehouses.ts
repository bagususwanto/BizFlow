import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  warehousesService,
  WarehousesQuery,
} from '@/services/warehouses.service';
import { useAuthStore } from '@/stores/auth.store';
import { toast } from 'sonner';

export function useWarehouses(params?: WarehousesQuery) {
  const token = useAuthStore((state) => state.accessToken);
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['warehouses', params],
    queryFn: () => warehousesService.getAll(params),
    enabled: !!token,
    placeholderData: (previousData) => previousData,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => warehousesService.delete(id),
    onSuccess: (response) => {
      const message =
        (response as any).data?.message || 'Gudang berhasil dihapus';
      toast.success(message);
      queryClient.invalidateQueries({ queryKey: ['warehouses'] });
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const bulkDeleteMutation = useMutation({
    mutationFn: (ids: string[]) => warehousesService.bulkDelete(ids),
    onSuccess: (response) => {
      const message =
        (response as any).data?.message || 'Gudang berhasil dihapus';
      toast.success(message);
      queryClient.invalidateQueries({ queryKey: ['warehouses'] });
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  return {
    warehouses: query.data?.data || [],
    meta: query.data?.meta,
    summary: query.data?.summary,
    isLoading: query.isLoading,
    isError: query.isError,
    deleteWarehouse: deleteMutation.mutate,
    isDeleting: deleteMutation.isPending,
    bulkDeleteWarehouses: bulkDeleteMutation.mutate,
    isBulkDeleting: bulkDeleteMutation.isPending,
    refetch: query.refetch,
  };
}

export function useWarehouse(id: string) {
  const token = useAuthStore((state) => state.accessToken);

  return useQuery({
    queryKey: ['warehouse', id],
    queryFn: () => warehousesService.getById(id),
    enabled: !!token && !!id,
  });
}

export function useCreateWarehouse() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Parameters<typeof warehousesService.create>[0]) =>
      warehousesService.create(data),
    onSuccess: () => {
      toast.success('Gudang berhasil ditambahkan');
      queryClient.invalidateQueries({ queryKey: ['warehouses'] });
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useUpdateWarehouse(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Parameters<typeof warehousesService.update>[1]) =>
      warehousesService.update(id, data),
    onSuccess: () => {
      toast.success('Gudang berhasil diperbarui');
      queryClient.invalidateQueries({ queryKey: ['warehouses'] });
      queryClient.invalidateQueries({ queryKey: ['warehouse', id] });
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useActiveWarehouses() {
  const token = useAuthStore((state) => state.accessToken);

  return useQuery({
    queryKey: ['warehouses', 'active'],
    queryFn: () => warehousesService.getActiveList(),
    enabled: !!token,
  });
}

export function useGenerateWarehouseCode() {
  const token = useAuthStore((state) => state.accessToken);

  return useQuery({
    queryKey: ['warehouse', 'generate-code'],
    queryFn: () => warehousesService.generateCode(),
    enabled: !!token,
    staleTime: 0,
  });
}
