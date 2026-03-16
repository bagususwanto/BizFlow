import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { salesInvoicesService } from '@/services/sales-invoices.service';
import { useAuthStore } from '@/stores/auth.store';
import { toast } from 'sonner';
import {
  QueryInvoicesValues,
  CreateInvoiceValues,
  UpdateInvoiceValues,
  UpdateInvoiceStatusValues,
} from '@bizflow/types';
import { useRouter } from 'next/navigation';

export function useSalesInvoices(params?: QueryInvoicesValues) {
  const token = useAuthStore((state) => state.accessToken);

  return useQuery({
    queryKey: ['sales-invoices', params],
    queryFn: () => salesInvoicesService.getAll(params),
    enabled: !!token,
    placeholderData: (previousData) => previousData,
  });
}

export function useSalesInvoice(id: string) {
  const token = useAuthStore((state) => state.accessToken);

  return useQuery({
    queryKey: ['sales-invoices', id],
    queryFn: () => salesInvoicesService.getById(id),
    enabled: !!token && !!id,
  });
}

export function useCreateSalesInvoice() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: (data: CreateInvoiceValues) =>
      salesInvoicesService.create(data),
    onSuccess: async (response) => {
      const message = (response as any).data?.message || 'Invoice berhasil dibuat';
      toast.success(message);
      await queryClient.invalidateQueries({
        queryKey: ['sales-invoices'],
        refetchType: 'all',
      });
      router.push('/sales/invoices');
      router.refresh(); // Refresh client router cache
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useUpdateSalesInvoice(id: string) {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: (data: UpdateInvoiceValues) =>
      salesInvoicesService.update(id, data),
    onSuccess: async (response) => {
      const message = (response as any).data?.message || 'Invoice berhasil diperbarui';
      toast.success(message);
      await queryClient.invalidateQueries({
        queryKey: ['sales-invoices'],
        refetchType: 'all',
      });
      await queryClient.invalidateQueries({
        queryKey: ['sales-invoices', id],
        refetchType: 'all',
      });
      router.push('/sales/invoices');
      router.refresh(); // Refresh client router cache
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useDeleteSalesInvoice() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: (id: string) => salesInvoicesService.delete(id),
    onSuccess: async (response) => {
      const message = (response as any).data?.message || 'Invoice berhasil dihapus';
      toast.success(message);
      await queryClient.invalidateQueries({
        queryKey: ['sales-invoices'],
        refetchType: 'all',
      });
      router.refresh();
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useBulkDeleteSalesInvoices() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: (ids: string[]) => salesInvoicesService.bulkDelete(ids),
    onSuccess: async (response) => {
      const message = (response as any).data?.message || 'Invoices berhasil dihapus';
      toast.success(message);
      await queryClient.invalidateQueries({
        queryKey: ['sales-invoices'],
        refetchType: 'all',
      });
      router.refresh();
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useUpdateSalesInvoiceStatus(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateInvoiceStatusValues) =>
      salesInvoicesService.updateStatus(id, data),
    onSuccess: async (response) => {
      const message = (response as any).data?.message || 'Status Invoice berhasil diperbarui';
      toast.success(message);
      await queryClient.invalidateQueries({
        queryKey: ['sales-invoices'],
        refetchType: 'all',
      });
      await queryClient.invalidateQueries({
        queryKey: ['sales-invoices', id],
        refetchType: 'all',
      });
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}
