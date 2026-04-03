import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { salesReturnsService } from '@/services/sales-returns.service';
import {
  QuerySalesReturnsValues,
  CreateSalesReturnValues,
  UpdateSalesReturnValues,
  UpdateSalesReturnStatusValues,
} from '@bizflow/types';
import { toast } from 'sonner';

export const salesReturnKeys = {
  all: ['sales-returns'] as const,
  lists: () => [...salesReturnKeys.all, 'list'] as const,
  list: (filters: QuerySalesReturnsValues) =>
    [...salesReturnKeys.lists(), filters] as const,
  details: () => [...salesReturnKeys.all, 'detail'] as const,
  detail: (id: string) => [...salesReturnKeys.details(), id] as const,
};

export function useSalesReturns(params?: QuerySalesReturnsValues) {
  const queryParams = {
    page: 1,
    pageSize: 10,
    ...params,
  };

  return useQuery({
    queryKey: salesReturnKeys.list(queryParams),
    queryFn: () => salesReturnsService.getAll(queryParams),
  });
}

export function useSalesReturn(id: string) {
  return useQuery({
    queryKey: salesReturnKeys.detail(id),
    queryFn: () => salesReturnsService.getById(id),
    enabled: !!id,
  });
}

export function useCreateSalesReturn() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateSalesReturnValues) =>
      salesReturnsService.create(data),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: salesReturnKeys.lists() });
      const message =
        (response as any).data?.message || 'Sales Return berhasil dibuat';
      toast.success(message);
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useUpdateSalesReturn() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: UpdateSalesReturnValues;
    }) => salesReturnsService.update(id, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: salesReturnKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: salesReturnKeys.detail(data.id),
      });
      const message =
        (data as any).data?.message || 'Sales Return berhasil diperbarui';
      toast.success(message);
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useUpdateSalesReturnStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: UpdateSalesReturnStatusValues;
    }) => salesReturnsService.updateStatus(id, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: salesReturnKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: salesReturnKeys.detail(data.id),
      });
      const message =
        (data as any).data?.message ||
        'Status Sales Return berhasil diperbarui';
      toast.success(message);
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useDeleteSalesReturn() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => salesReturnsService.delete(id),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: salesReturnKeys.lists() });
      const message =
        (response as any).data?.message || 'Sales Return berhasil dihapus';
      toast.success(message);
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useBulkDeleteSalesReturns() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (ids: string[]) => salesReturnsService.bulkDelete(ids),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: salesReturnKeys.lists() });
      const message =
        (response as any).data?.message || 'Sales Return berhasil dihapus';
      toast.success(message);
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useGenerateReturnNumber() {
  return useQuery({
    queryKey: ['generate-return-number-sales'],
    queryFn: () => salesReturnsService.generateReturnNumber(),
    enabled: false, // Manual trigger
  });
}
