import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { salesOrdersService } from '@/services/sales-orders.service';
import { useAuthStore } from '@/stores/auth.store';
import { toast } from 'sonner';
import {
  QuerySalesOrdersValues,
  CreateSalesOrderValues,
  UpdateSalesOrderValues,
  UpdateSalesOrderStatusValues,
} from '@bizflow/types';
import { useRouter } from 'next/navigation';

export function useSalesOrders(params?: QuerySalesOrdersValues) {
  const token = useAuthStore((state) => state.accessToken);

  return useQuery({
    queryKey: ['sales-orders', params],
    queryFn: () => salesOrdersService.getAll(params),
    enabled: !!token,
    placeholderData: (previousData) => previousData,
  });
}

export function useSalesOrder(id: string) {
  const token = useAuthStore((state) => state.accessToken);

  return useQuery({
    queryKey: ['sales-orders', id],
    queryFn: () => salesOrdersService.getById(id),
    enabled: !!token && !!id,
  });
}

export function useCreateSalesOrder() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: (data: CreateSalesOrderValues) =>
      salesOrdersService.create(data),
    onSuccess: async (response) => {
      const message = (response as any).data?.message || 'Sales Order berhasil dibuat';
      toast.success(message);
      await queryClient.invalidateQueries({
        queryKey: ['sales-orders'],
        refetchType: 'all',
      });
      router.push('/sales/orders');
      router.refresh(); // Refresh client router cache
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useUpdateSalesOrder(id: string) {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: (data: UpdateSalesOrderValues) =>
      salesOrdersService.update(id, data),
    onSuccess: async (response) => {
      const message = (response as any).data?.message || 'Sales Order berhasil diperbarui';
      toast.success(message);
      await queryClient.invalidateQueries({
        queryKey: ['sales-orders'],
        refetchType: 'all',
      });
      await queryClient.invalidateQueries({
        queryKey: ['sales-orders', id],
        refetchType: 'all',
      });
      router.push('/sales/orders');
      router.refresh(); // Refresh client router cache
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useDeleteSalesOrder() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: (id: string) => salesOrdersService.delete(id),
    onSuccess: async (response) => {
      const message = (response as any).data?.message || 'Sales Order berhasil dihapus';
      toast.success(message);
      await queryClient.invalidateQueries({
        queryKey: ['sales-orders'],
        refetchType: 'all',
      });
      router.refresh();
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useBulkDeleteSalesOrders() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: (ids: string[]) => salesOrdersService.bulkDelete(ids),
    onSuccess: async (response) => {
      const message = (response as any).data?.message || 'Sales Orders berhasil dihapus';
      toast.success(message);
      await queryClient.invalidateQueries({
        queryKey: ['sales-orders'],
        refetchType: 'all',
      });
      router.refresh();
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useUpdateSalesOrderStatus(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateSalesOrderStatusValues) =>
      salesOrdersService.updateStatus(id, data),
    onSuccess: async (response) => {
      const message = (response as any).data?.message || 'Status Sales Order berhasil diperbarui';
      toast.success(message);
      await queryClient.invalidateQueries({
        queryKey: ['sales-orders'],
        refetchType: 'all',
      });
      await queryClient.invalidateQueries({
        queryKey: ['sales-orders', id],
        refetchType: 'all',
      });
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}
