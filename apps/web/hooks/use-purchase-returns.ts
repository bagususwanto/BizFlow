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
    onSuccess: async (response) => {
      await queryClient.invalidateQueries({ queryKey: purchaseReturnKeys.lists() });
      const message = (response as any).data?.message || 'Purchase Return berhasil dibuat';
      toast.success(message);
    },
    onError: (error: Error) => {
        toast.error(error.message);
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
    onSuccess: async (data, variables) => {
      await queryClient.invalidateQueries({ queryKey: purchaseReturnKeys.lists() });
      await queryClient.invalidateQueries({
        queryKey: purchaseReturnKeys.detail(variables.id),
      });
      const message = (data as any).data?.message || 'Purchase Return berhasil diperbarui';
      toast.success(message);
    },
    onError: (error: Error) => {
        toast.error(error.message);
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
    onSuccess: async (data, variables) => {
      await queryClient.invalidateQueries({ queryKey: purchaseReturnKeys.lists() });
      await queryClient.invalidateQueries({
        queryKey: purchaseReturnKeys.detail(variables.id),
      });
      const message = (data as any).data?.message || 'Status Purchase Return berhasil diperbarui';
      toast.success(message);
    },
    onError: (error: Error) => {
        toast.error(error.message);
    },
  });
}

export function useDeletePurchaseReturn() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => purchaseReturnsService.delete(id),
    onSuccess: async (response) => {
      await queryClient.invalidateQueries({ queryKey: purchaseReturnKeys.lists() });
      const message = (response as any).data?.message || 'Purchase Return berhasil dihapus';
      toast.success(message);
    },
    onError: (error: Error) => {
        toast.error(error.message);
    },
  });
}

export function useBulkDeletePurchaseReturns() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (ids: string[]) => purchaseReturnsService.bulkDelete(ids),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: purchaseReturnKeys.lists() });
        const message = (response as any).data?.message || 'Purchase Return berhasil dihapus';
      toast.success(message);
    },
    onError: (error: Error) => {
        toast.error(error.message);
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
