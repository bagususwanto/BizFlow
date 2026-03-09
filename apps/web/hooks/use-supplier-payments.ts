import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  supplierPaymentsService,
  SupplierPaymentListResponse,
} from '@/services/supplier-payments.service';
import {
  CreateSupplierPaymentValues,
  UpdateSupplierPaymentValues,
  QuerySupplierPaymentsValues,
} from '@bizflow/types';
import { toast } from 'sonner';

export const supplierPaymentKeys = {
  all: ['supplier-payments'] as const,
  lists: () => [...supplierPaymentKeys.all, 'list'] as const,
  list: (params: QuerySupplierPaymentsValues) =>
    [...supplierPaymentKeys.lists(), params] as const,
  details: () => [...supplierPaymentKeys.all, 'detail'] as const,
  detail: (id: string) => [...supplierPaymentKeys.details(), id] as const,
};

export function useSupplierPayments(params: QuerySupplierPaymentsValues) {
  return useQuery({
    queryKey: supplierPaymentKeys.list(params),
    queryFn: () => supplierPaymentsService.getAll(params),
  });
}

export function useSupplierPayment(id: string) {
  return useQuery({
    queryKey: supplierPaymentKeys.detail(id),
    queryFn: () => supplierPaymentsService.getById(id),
    enabled: !!id,
  });
}

export function useCreateSupplierPayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateSupplierPaymentValues) =>
      supplierPaymentsService.create(data),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: supplierPaymentKeys.lists() });
        const message = (response as any).data?.message || 'Pembayaran berhasil dibuat';
      toast.success(message);
    },
    onError: (error: Error) => {
        toast.error(error.message);
    },
  });
}

export function useUpdateSupplierPayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: UpdateSupplierPaymentValues;
    }) => supplierPaymentsService.update(id, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: supplierPaymentKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: supplierPaymentKeys.detail(data.id),
      });
        const message = (data as any).data?.message || 'Pembayaran berhasil diperbarui';
      toast.success(message);
    },
    onError: (error: Error) => {
        toast.error(error.message);
    },
  });
}

export function useDeleteSupplierPayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => supplierPaymentsService.delete(id),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: supplierPaymentKeys.lists() });
        const message = (response as any).data?.message || 'Pembayaran berhasil dihapus';
      toast.success(message);
    },
    onError: (error: Error) => {
        toast.error(error.message);
    },
  });
}

export function useBulkDeleteSupplierPayments() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (ids: string[]) => supplierPaymentsService.bulkDelete(ids),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: supplierPaymentKeys.lists() });
        const message = (response as any).data?.message || 'Pembayaran berhasil dihapus';
      toast.success(message);
    },
    onError: (error: Error) => {
        toast.error(error.message);
    },
  });
}

export function useGeneratePaymentNumber() {
  return useQuery({
    queryKey: ['generate-payment-number'],
    queryFn: () => supplierPaymentsService.generatePaymentNumber(),
    enabled: false, // Don't run automatically
  });
}
