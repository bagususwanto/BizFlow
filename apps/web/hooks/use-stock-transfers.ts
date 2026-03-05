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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: stockTransferKeys.lists() });
      toast.success('Stock Transfer berhasil dibuat');
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message || 'Gagal membuat stock transfer',
      );
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
      toast.success('Stock Transfer berhasil diperbarui');
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message || 'Gagal memperbarui stock transfer',
      );
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
      toast.success('Status Stock Transfer berhasil diperbarui');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Gagal memperbarui status');
    },
  });
}

export function useDeleteStockTransfer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => stockTransfersService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: stockTransferKeys.lists() });
      toast.success('Stock Transfer berhasil dihapus');
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message || 'Gagal menghapus stock transfer',
      );
    },
  });
}

export function useBulkDeleteStockTransfers() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (ids: string[]) => stockTransfersService.bulkDelete(ids),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: stockTransferKeys.lists() });
      toast.success('Stock Transfer berhasil dihapus');
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message || 'Gagal menghapus stock transfer',
      );
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
