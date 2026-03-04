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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: stockAdjustmentKeys.lists() });
      toast.success('Stock Adjustment berhasil dibuat');
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message || 'Gagal membuat stock adjustment',
      );
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
      toast.success('Stock Adjustment berhasil diperbarui');
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message || 'Gagal memperbarui stock adjustment',
      );
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
      toast.success('Status Stock Adjustment berhasil diperbarui');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Gagal memperbarui status');
    },
  });
}

export function useDeleteStockAdjustment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => stockAdjustmentsService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: stockAdjustmentKeys.lists() });
      toast.success('Stock Adjustment berhasil dihapus');
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message || 'Gagal menghapus stock adjustment',
      );
    },
  });
}

export function useBulkDeleteStockAdjustments() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (ids: string[]) => stockAdjustmentsService.bulkDelete(ids),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: stockAdjustmentKeys.lists() });
      toast.success('Stock Adjustment berhasil dihapus');
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message || 'Gagal menghapus stock adjustment',
      );
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
