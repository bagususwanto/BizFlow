import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { stockAdjustmentsService } from '@/services/stock-adjustments.service';
import {
  QueryStockAdjustmentsValues,
  CreateStockAdjustmentValues,
  UpdateStockAdjustmentValues,
  UpdateStockAdjustmentStatusValues,
} from '@bizflow/types';
import { toast } from 'sonner';

export const stockAdjustmentKeys = {
  all: ['stock-adjustments'] as const,
  lists: () => [...stockAdjustmentKeys.all, 'list'] as const,
  list: (filters: QueryStockAdjustmentsValues) =>
    [...stockAdjustmentKeys.lists(), filters] as const,
  details: () => [...stockAdjustmentKeys.all, 'detail'] as const,
  detail: (id: string) => [...stockAdjustmentKeys.details(), id] as const,
};

export function useStockAdjustments(params?: QueryStockAdjustmentsValues) {
  const queryParams = {
    page: 1,
    pageSize: 10,
    ...params,
  };

  return useQuery({
    queryKey: stockAdjustmentKeys.list(queryParams),
    queryFn: () => stockAdjustmentsService.getAll(queryParams),
  });
}

export function useStockAdjustment(id: string) {
  return useQuery({
    queryKey: stockAdjustmentKeys.detail(id),
    queryFn: () => stockAdjustmentsService.getById(id),
    enabled: !!id,
  });
}

export function useCreateStockAdjustment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateStockAdjustmentValues) =>
      stockAdjustmentsService.create(data),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: stockAdjustmentKeys.lists() });
        const message = (response as any).data?.message || 'Stock Adjustment berhasil dibuat';
      toast.success(message);
    },
    onError: (error: Error) => {
        toast.error(error.message);
    },
  });
}

export function useUpdateStockAdjustment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: UpdateStockAdjustmentValues;
    }) => stockAdjustmentsService.update(id, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: stockAdjustmentKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: stockAdjustmentKeys.detail(data.id),
      });
        const message = (data as any).data?.message || 'Stock Adjustment berhasil diperbarui';
      toast.success(message);
    },
    onError: (error: Error) => {
        toast.error(error.message);
    },
  });
}

export function useUpdateStockAdjustmentStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: UpdateStockAdjustmentStatusValues;
    }) => stockAdjustmentsService.updateStatus(id, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: stockAdjustmentKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: stockAdjustmentKeys.detail(data.id),
      });
        const message = (data as any).data?.message || 'Status Stock Adjustment berhasil diperbarui';
      toast.success(message);
    },
    onError: (error: Error) => {
        toast.error(error.message);
    },
  });
}

export function useDeleteStockAdjustment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => stockAdjustmentsService.delete(id),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: stockAdjustmentKeys.lists() });
        const message = (response as any).data?.message || 'Stock Adjustment berhasil dihapus';
      toast.success(message);
    },
    onError: (error: Error) => {
        toast.error(error.message);
    },
  });
}

export function useBulkDeleteStockAdjustments() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (ids: string[]) => stockAdjustmentsService.bulkDelete(ids),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: stockAdjustmentKeys.lists() });
        const message = (response as any).data?.message || 'Stock Adjustment berhasil dihapus';
      toast.success(message);
    },
    onError: (error: Error) => {
        toast.error(error.message);
    },
  });
}

export function useGenerateAdjustmentNumber() {
  return useQuery({
    queryKey: ['generate-adjustment-number'],
    queryFn: () => stockAdjustmentsService.generateAdjustmentNumber(),
    enabled: false, // Manual trigger
  });
}
