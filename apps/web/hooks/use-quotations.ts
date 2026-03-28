import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { quotationsService } from '@/services/quotations.service';
import { useAuthStore } from '@/stores/auth.store';
import { toast } from 'sonner';
import {
  QueryQuotationsValues,
  CreateQuotationValues,
  UpdateQuotationValues,
  UpdateQuotationStatusValues,
  ConvertQuotationValues,
} from '@bizflow/types';
import { useRouter } from 'next/navigation';

export function useQuotations(params?: QueryQuotationsValues) {
  const token = useAuthStore((state) => state.accessToken);

  return useQuery({
    queryKey: ['quotations', params],
    queryFn: () => quotationsService.getAll(params),
    enabled: !!token,
    placeholderData: (previousData) => previousData,
  });
}

export function useQuotation(id: string) {
  const token = useAuthStore((state) => state.accessToken);

  return useQuery({
    queryKey: ['quotations', id],
    queryFn: () => quotationsService.getById(id),
    enabled: !!token && !!id,
  });
}

export function useCreateQuotation() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: (data: CreateQuotationValues) =>
      quotationsService.create(data),
    onSuccess: async (response) => {
      const message =
        (response as any).data?.message || 'Penawaran Harga berhasil dibuat';
      toast.success(message);
      await queryClient.invalidateQueries({
        queryKey: ['quotations'],
        refetchType: 'all',
      });
      router.push('/sales/quotations');
      router.refresh();
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useUpdateQuotation(id: string) {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: (data: UpdateQuotationValues) =>
      quotationsService.update(id, data),
    onSuccess: async (response) => {
      const message =
        (response as any).data?.message || 'Penawaran Harga berhasil diperbarui';
      toast.success(message);
      await queryClient.invalidateQueries({
        queryKey: ['quotations'],
        refetchType: 'all',
      });
      await queryClient.invalidateQueries({
        queryKey: ['quotations', id],
        refetchType: 'all',
      });
      router.push('/sales/quotations');
      router.refresh();
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useDeleteQuotation() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: (id: string) => quotationsService.delete(id),
    onSuccess: async (response) => {
      const message =
        (response as any).data?.message || 'Penawaran Harga berhasil dihapus';
      toast.success(message);
      await queryClient.invalidateQueries({
        queryKey: ['quotations'],
        refetchType: 'all',
      });
      router.refresh();
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useBulkDeleteQuotations() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: (ids: string[]) => quotationsService.bulkDelete(ids),
    onSuccess: async (response) => {
      const message =
        (response as any).data?.message || 'Penawaran Harga berhasil dihapus';
      toast.success(message);
      await queryClient.invalidateQueries({
        queryKey: ['quotations'],
        refetchType: 'all',
      });
      router.refresh();
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useUpdateQuotationStatus(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateQuotationStatusValues) =>
      quotationsService.updateStatus(id, data),
    onSuccess: async (response) => {
      const message =
        (response as any).data?.message || 'Status Penawaran Harga berhasil diperbarui';
      toast.success(message);
      await queryClient.invalidateQueries({
        queryKey: ['quotations'],
        refetchType: 'all',
      });
      await queryClient.invalidateQueries({
        queryKey: ['quotations', id],
        refetchType: 'all',
      });
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useConvertQuotationToSalesOrder(id: string) {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: (data: ConvertQuotationValues) =>
      quotationsService.convertToSalesOrder(id, data),
    onSuccess: async (response) => {
      const message =
        (response as any).data?.message || 'Berhasil dikonversi menjadi Sales Order';
      toast.success(message);
      
      // Invalidate quotations
      await queryClient.invalidateQueries({
        queryKey: ['quotations'],
        refetchType: 'all',
      });
      await queryClient.invalidateQueries({
        queryKey: ['quotations', id],
        refetchType: 'all',
      });
      
      // Invalidate sales orders
      await queryClient.invalidateQueries({
        queryKey: ['sales-orders'],
        refetchType: 'all',
      });
      
      router.push('/sales/quotations');
      router.refresh();
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}
