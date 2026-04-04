import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  customerPaymentsService,
  CustomerPaymentListResponse,
} from '@/services/customer-payments.service';
import {
  CreateCustomerPaymentValues,
  UpdateCustomerPaymentValues,
  QueryCustomerPaymentsValues,
} from '@bizflow/types';
import { toast } from 'sonner';

export const customerPaymentKeys = {
  all: ['customer-payments'] as const,
  lists: () => [...customerPaymentKeys.all, 'list'] as const,
  list: (params: QueryCustomerPaymentsValues) =>
    [...customerPaymentKeys.lists(), params] as const,
  details: () => [...customerPaymentKeys.all, 'detail'] as const,
  detail: (id: string) => [...customerPaymentKeys.details(), id] as const,
};

export function useCustomerPayments(params: QueryCustomerPaymentsValues) {
  return useQuery({
    queryKey: customerPaymentKeys.list(params),
    queryFn: () => customerPaymentsService.getAll(params),
  });
}

export function useCustomerPayment(id: string) {
  return useQuery({
    queryKey: customerPaymentKeys.detail(id),
    queryFn: () => customerPaymentsService.getById(id),
    enabled: !!id,
  });
}

export function useCreateCustomerPayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateCustomerPaymentValues) =>
      customerPaymentsService.create(data),
    onSuccess: async (response) => {
      await queryClient.invalidateQueries({ queryKey: customerPaymentKeys.lists() });
      const message = (response as any).data?.message || 'Pembayaran berhasil dibuat';
      toast.success(message);
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useUpdateCustomerPayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: UpdateCustomerPaymentValues;
    }) => customerPaymentsService.update(id, data),
    onSuccess: async (data, variables) => {
      await queryClient.invalidateQueries({ queryKey: customerPaymentKeys.lists() });
      await queryClient.invalidateQueries({
        queryKey: customerPaymentKeys.detail(variables.id),
      });
      const message = (data as any).data?.message || 'Pembayaran berhasil diperbarui';
      toast.success(message);
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useDeleteCustomerPayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => customerPaymentsService.delete(id),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: customerPaymentKeys.lists() });
      const message = (response as any).data?.message || 'Pembayaran berhasil dihapus';
      toast.success(message);
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useBulkDeleteCustomerPayments() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (ids: string[]) => customerPaymentsService.bulkDelete(ids),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: customerPaymentKeys.lists() });
      const message = (response as any).data?.message || 'Pembayaran berhasil dihapus';
      toast.success(message);
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useGenerateCustomerPaymentNumber() {
  return useQuery({
    queryKey: ['generate-customer-payment-number'],
    queryFn: () => customerPaymentsService.generatePaymentNumber(),
    enabled: false, // Don't run automatically
  });
}
