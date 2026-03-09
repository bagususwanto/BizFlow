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
    onSuccess: async (response) => {
        const message = (response as any).data?.message || 'Purchase Order berhasil dibuat';
      toast.success(message);
      await queryClient.invalidateQueries({
        queryKey: ['purchase-orders'],
        refetchType: 'all',
      });
      router.push('/purchases/orders');
      router.refresh(); // Refresh client router cache
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
    onSuccess: async (response) => {
        const message = (response as any).data?.message || 'Purchase Order berhasil diperbarui';
      toast.success(message);
      await queryClient.invalidateQueries({
        queryKey: ['purchase-orders'],
        refetchType: 'all',
      });
      await queryClient.invalidateQueries({
        queryKey: ['purchase-orders', id],
        refetchType: 'all',
      });
      router.push('/purchases/orders');
      router.refresh(); // Refresh client router cache
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useDeletePurchaseOrder() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: (id: string) => purchaseOrdersService.delete(id),
    onSuccess: async (response) => {
        const message = (response as any).data?.message || 'Purchase Order berhasil dihapus';
      toast.success(message);
      await queryClient.invalidateQueries({
        queryKey: ['purchase-orders'],
        refetchType: 'all',
      });
      router.refresh();
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useBulkDeletePurchaseOrders() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: (ids: string[]) => purchaseOrdersService.bulkDelete(ids),
    onSuccess: async (response) => {
        const message = (response as any).data?.message || 'Purchase Orders berhasil dihapus';
      toast.success(message);
      await queryClient.invalidateQueries({
        queryKey: ['purchase-orders'],
        refetchType: 'all',
      });
      router.refresh();
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useUpdatePurchaseOrderStatus(id: string) {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: (data: UpdatePurchaseOrderStatusValues) =>
      purchaseOrdersService.updateStatus(id, data),
    onSuccess: async (response) => {
        const message = (response as any).data?.message || 'Status Purchase Order berhasil diperbarui';
      toast.success(message);
      await queryClient.invalidateQueries({
        queryKey: ['purchase-orders'],
        refetchType: 'all',
      });
      await queryClient.invalidateQueries({
        queryKey: ['purchase-orders', id],
        refetchType: 'all',
      });
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function usePreviewAutoReorder() {
  return useMutation({
    mutationFn: (variantIds: string[]) =>
      purchaseOrdersService.previewAutoReorder(variantIds),
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useExecuteAutoReorder() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: (variantIds: string[]) =>
      purchaseOrdersService.executeAutoReorder(variantIds),
    onSuccess: async (data) => {
        const message = (data as any).data?.message || `Auto-Reorder berhasil! ${data.createdOrders} Draft PO dibuat.${
                  data.skippedVariants > 0
                    ? ` ${data.skippedVariants} varian dilewati karena tidak ada riwayat pemasok.`
                    : ''
                }`;
      toast.success(
        message,
      );
      await queryClient.invalidateQueries({
        queryKey: ['purchase-orders'],
        refetchType: 'all',
      });
      router.push('/purchases/orders');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}
