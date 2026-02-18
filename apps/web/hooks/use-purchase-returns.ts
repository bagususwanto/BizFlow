import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { purchaseReturnsService } from '@/services/purchase-returns.service';
import {
  QueryPurchaseReturnsValues,
  CreatePurchaseReturnValues,
  UpdatePurchaseReturnValues,
  UpdatePurchaseReturnStatusValues,
} from '@bizflow/types';
import { toast } from 'sonner';

export const purchaseReturnKeys = {
  all: ['purchase-returns'] as const,
  lists: () => [...purchaseReturnKeys.all, 'list'] as const,
  list: (filters: QueryPurchaseReturnsValues) =>
    [...purchaseReturnKeys.lists(), filters] as const,
  details: () => [...purchaseReturnKeys.all, 'detail'] as const,
  detail: (id: string) => [...purchaseReturnKeys.details(), id] as const,
};

export function usePurchaseReturns(params?: QueryPurchaseReturnsValues) {
  const queryParams = {
    page: 1,
    pageSize: 10,
    ...params,
  };

  return useQuery({
    queryKey: purchaseReturnKeys.list(queryParams),
    queryFn: () => purchaseReturnsService.getAll(queryParams),
  });
}

export function usePurchaseReturn(id: string) {
  return useQuery({
    queryKey: purchaseReturnKeys.detail(id),
    queryFn: () => purchaseReturnsService.getById(id),
    enabled: !!id,
  });
}

export function useCreatePurchaseReturn() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreatePurchaseReturnValues) =>
      purchaseReturnsService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: purchaseReturnKeys.lists() });
      toast.success('Purchase Return berhasil dibuat');
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message || 'Gagal membuat purchase return',
      );
    },
  });
}

export function useUpdatePurchaseReturn() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: UpdatePurchaseReturnValues;
    }) => purchaseReturnsService.update(id, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: purchaseReturnKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: purchaseReturnKeys.detail(data.id),
      });
      toast.success('Purchase Return berhasil diperbarui');
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message || 'Gagal memperbarui purchase return',
      );
    },
  });
}

export function useUpdatePurchaseReturnStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: UpdatePurchaseReturnStatusValues;
    }) => purchaseReturnsService.updateStatus(id, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: purchaseReturnKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: purchaseReturnKeys.detail(data.id),
      });
      toast.success('Status Purchase Return berhasil diperbarui');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Gagal memperbarui status');
    },
  });
}

export function useDeletePurchaseReturn() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => purchaseReturnsService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: purchaseReturnKeys.lists() });
      toast.success('Purchase Return berhasil dihapus');
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message || 'Gagal menghapus purchase return',
      );
    },
  });
}

export function useGenerateReturnNumber() {
  return useQuery({
    queryKey: ['generate-return-number'],
    queryFn: () => purchaseReturnsService.generateReturnNumber(),
    enabled: false, // Manual trigger
  });
}
