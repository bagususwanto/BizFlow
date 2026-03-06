import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { stockOpnamesService } from '@/services/stock-opnames.service';
import {
  QueryStockOpnamesValues,
  CreateStockOpnameValues,
  UpdateStockOpnameItemsValues,
  FinalizeStockOpnameValues,
  CancelStockOpnameValues,
} from '@bizflow/types';
import { toast } from 'sonner';

export const stockOpnameKeys = {
  all: ['stock-opnames'] as const,
  lists: () => [...stockOpnameKeys.all, 'list'] as const,
  list: (filters: QueryStockOpnamesValues) =>
    [...stockOpnameKeys.lists(), filters] as const,
  details: () => [...stockOpnameKeys.all, 'detail'] as const,
  detail: (id: string) => [...stockOpnameKeys.details(), id] as const,
};

export function useStockOpnames(params?: QueryStockOpnamesValues) {
  const queryParams = {
    page: 1,
    pageSize: 10,
    ...params,
  };

  return useQuery({
    queryKey: stockOpnameKeys.list(queryParams),
    queryFn: () => stockOpnamesService.getAll(queryParams),
  });
}

export function useStockOpname(id: string) {
  return useQuery({
    queryKey: stockOpnameKeys.detail(id),
    queryFn: () => stockOpnamesService.getById(id),
    enabled: !!id,
  });
}

export function useCreateStockOpname() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateStockOpnameValues) =>
      stockOpnamesService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: stockOpnameKeys.lists() });
      toast.success('Stock Opname berhasil dibuat');
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message || 'Gagal membuat stock opname',
      );
    },
  });
}

export function useUpdateStockOpnameItems() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: UpdateStockOpnameItemsValues;
    }) => stockOpnamesService.updateItems(id, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: stockOpnameKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: stockOpnameKeys.detail(data.id),
      });
      toast.success('Item Stock Opname berhasil diperbarui');
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message || 'Gagal memperbarui item stock opname',
      );
    },
  });
}

export function useFinalizeStockOpname() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: FinalizeStockOpnameValues;
    }) => stockOpnamesService.finalize(id, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: stockOpnameKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: stockOpnameKeys.detail(data.id),
      });
      toast.success('Stock Opname berhasil finalisasi');
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message || 'Gagal finalisasi stock opname',
      );
    },
  });
}

export function useCancelStockOpname() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: CancelStockOpnameValues }) =>
      stockOpnamesService.cancel(id, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: stockOpnameKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: stockOpnameKeys.detail(data.id),
      });
      toast.success('Stock Opname berhasil dibatalkan');
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message || 'Gagal membatalkan stock opname',
      );
    },
  });
}

export function useDeleteStockOpname() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => stockOpnamesService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: stockOpnameKeys.lists() });
      toast.success('Stock Opname berhasil dihapus');
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message || 'Gagal menghapus stock opname',
      );
    },
  });
}

export function useBulkDeleteStockOpnames() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (ids: string[]) => stockOpnamesService.bulkDelete(ids),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: stockOpnameKeys.lists() });
      toast.success('Stock Opname berhasil dihapus');
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message || 'Gagal menghapus stock opname',
      );
    },
  });
}

export function useGenerateOpnameNumber() {
  return useQuery({
    queryKey: ['generate-opname-number'],
    queryFn: () => stockOpnamesService.generateOpnameNumber(),
    enabled: false, // Manual trigger
  });
}
