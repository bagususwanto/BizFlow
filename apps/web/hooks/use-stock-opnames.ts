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
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: stockOpnameKeys.lists() });
        const message = (response as any).data?.message || 'Stock Opname berhasil dibuat';
      toast.success(message);
    },
    onError: (error: Error) => {
        toast.error(error.message);
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
        const message = (data as any).data?.message || 'Item Stock Opname berhasil diperbarui';
      toast.success(message);
    },
    onError: (error: Error) => {
        toast.error(error.message);
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
        const message = (data as any).data?.message || 'Stock Opname berhasil finalisasi';
      toast.success(message);
    },
    onError: (error: Error) => {
        toast.error(error.message);
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
        const message = (data as any).data?.message || 'Stock Opname berhasil dibatalkan';
      toast.success(message);
    },
    onError: (error: Error) => {
        toast.error(error.message);
    },
  });
}

export function useDeleteStockOpname() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => stockOpnamesService.delete(id),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: stockOpnameKeys.lists() });
        const message = (response as any).data?.message || 'Stock Opname berhasil dihapus';
      toast.success(message);
    },
    onError: (error: Error) => {
        toast.error(error.message);
    },
  });
}

export function useBulkDeleteStockOpnames() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (ids: string[]) => stockOpnamesService.bulkDelete(ids),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: stockOpnameKeys.lists() });
        const message = (response as any).data?.message || 'Stock Opname berhasil dihapus';
      toast.success(message);
    },
    onError: (error: Error) => {
        toast.error(error.message);
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
