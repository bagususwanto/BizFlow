import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { stockTransfersService } from '@/services/stock-transfers.service';
import {
  QueryStockTransfersValues,
  CreateStockTransferValues,
  UpdateStockTransferValues,
  UpdateStockTransferStatusValues,
} from '@bizflow/types';
import { toast } from 'sonner';

export const stockTransferKeys = {
  all: ['stock-transfers'] as const,
  lists: () => [...stockTransferKeys.all, 'list'] as const,
  list: (filters: QueryStockTransfersValues) =>
    [...stockTransferKeys.lists(), filters] as const,
  details: () => [...stockTransferKeys.all, 'detail'] as const,
  detail: (id: string) => [...stockTransferKeys.details(), id] as const,
};

export function useStockTransfers(params?: QueryStockTransfersValues) {
  const queryParams = {
    page: 1,
    pageSize: 10,
    ...params,
  };

  return useQuery({
    queryKey: stockTransferKeys.list(queryParams),
    queryFn: () => stockTransfersService.getAll(queryParams),
  });
}

export function useStockTransfer(id: string) {
  return useQuery({
    queryKey: stockTransferKeys.detail(id),
    queryFn: () => stockTransfersService.getById(id),
    enabled: !!id,
  });
}

export function useCreateStockTransfer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateStockTransferValues) =>
      stockTransfersService.create(data),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: stockTransferKeys.lists() });
        const message = (response as any).data?.message || 'Stock Transfer berhasil dibuat';
      toast.success(message);
    },
    onError: (error: Error) => {
        toast.error(error.message);
    },
  });
}

export function useUpdateStockTransfer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: UpdateStockTransferValues;
    }) => stockTransfersService.update(id, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: stockTransferKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: stockTransferKeys.detail(data.id),
      });
        const message = (data as any).data?.message || 'Stock Transfer berhasil diperbarui';
      toast.success(message);
    },
    onError: (error: Error) => {
        toast.error(error.message);
    },
  });
}

export function useUpdateStockTransferStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: UpdateStockTransferStatusValues;
    }) => stockTransfersService.updateStatus(id, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: stockTransferKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: stockTransferKeys.detail(data.id),
      });
        const message = (data as any).data?.message || 'Status Stock Transfer berhasil diperbarui';
      toast.success(message);
    },
    onError: (error: Error) => {
        toast.error(error.message);
    },
  });
}

export function useDeleteStockTransfer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => stockTransfersService.delete(id),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: stockTransferKeys.lists() });
        const message = (response as any).data?.message || 'Stock Transfer berhasil dihapus';
      toast.success(message);
    },
    onError: (error: Error) => {
        toast.error(error.message);
    },
  });
}

export function useBulkDeleteStockTransfers() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (ids: string[]) => stockTransfersService.bulkDelete(ids),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: stockTransferKeys.lists() });
        const message = (response as any).data?.message || 'Stock Transfer berhasil dihapus';
      toast.success(message);
    },
    onError: (error: Error) => {
        toast.error(error.message);
    },
  });
}

export function useGenerateTransferNumber() {
  return useQuery({
    queryKey: ['generate-transfer-number'],
    queryFn: () => stockTransfersService.generateTransferNumber(),
    enabled: false, // Manual trigger
  });
}
