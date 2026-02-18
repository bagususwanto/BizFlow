import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { purchaseOrdersService } from '@/services/purchase-orders.service';
import { useAuthStore } from '@/stores/auth.store';
import { toast } from 'sonner';
import {
  QueryPurchaseOrdersValues,
  CreatePurchaseOrderValues,
  UpdatePurchaseOrderValues,
  UpdatePurchaseOrderStatusValues,
} from '@bizflow/types';
import { useRouter } from 'next/navigation';

export function usePurchaseOrders(params?: QueryPurchaseOrdersValues) {
  const token = useAuthStore((state) => state.accessToken);

  return useQuery({
    queryKey: ['purchase-orders', params],
    queryFn: () => purchaseOrdersService.getAll(params),
    enabled: !!token,
    placeholderData: (previousData) => previousData,
  });
}

export function usePurchaseOrder(id: string) {
  const token = useAuthStore((state) => state.accessToken);

  return useQuery({
    queryKey: ['purchase-orders', id],
    queryFn: () => purchaseOrdersService.getById(id),
    enabled: !!token && !!id,
  });
}

export function useCreatePurchaseOrder() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: (data: CreatePurchaseOrderValues) =>
      purchaseOrdersService.create(data),
    onSuccess: async () => {
      toast.success('Purchase Order berhasil dibuat');
      await queryClient.invalidateQueries({ queryKey: ['purchase-orders'] });
      router.refresh();
      router.push('/purchases/orders');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useUpdatePurchaseOrder(id: string) {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: (data: UpdatePurchaseOrderValues) =>
      purchaseOrdersService.update(id, data),
    onSuccess: async () => {
      toast.success('Purchase Order berhasil diperbarui');
      await queryClient.invalidateQueries({ queryKey: ['purchase-orders'] });
      await queryClient.invalidateQueries({
        queryKey: ['purchase-orders', id],
      });
      router.refresh();
      router.push('/purchases/orders');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useDeletePurchaseOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => purchaseOrdersService.delete(id),
    onSuccess: () => {
      toast.success('Purchase Order berhasil dihapus');
      queryClient.invalidateQueries({ queryKey: ['purchase-orders'] });
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useUpdatePurchaseOrderStatus(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdatePurchaseOrderStatusValues) =>
      purchaseOrdersService.updateStatus(id, data),
    onSuccess: async () => {
      toast.success('Status Purchase Order berhasil diperbarui');
      await queryClient.invalidateQueries({ queryKey: ['purchase-orders'] });
      await queryClient.invalidateQueries({
        queryKey: ['purchase-orders', id],
      });
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}
