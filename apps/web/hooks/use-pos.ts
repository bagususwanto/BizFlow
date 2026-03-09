import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  posTransactionsService,
  SearchProductsParams,
  CreateTransactionPayload,
} from '@/services/pos-transactions.service';
import {
  posPaymentsService,
  CreatePaymentPayload,
} from '@/services/pos-payments.service';
import { categoriesService } from '@/services/categories.service';
import { toast } from 'sonner';

// Products Hook
export function usePosProducts(params: SearchProductsParams) {
  return useQuery({
    queryKey: ['pos', 'products', params],
    queryFn: () => posTransactionsService.searchProducts(params),
    placeholderData: (previousData) => previousData,
    // Don't fetch if query is too short
    enabled: !params.query || params.query.length >= 2 || !!params.categoryId,
  });
}

export function usePosCategories() {
  return useQuery({
    queryKey: ['pos', 'categories'],
    queryFn: categoriesService.getActiveList,
  });
}

// Held Transactions Hook
export function useHeldTransactions() {
  return useQuery({
    queryKey: ['pos', 'held-transactions'],
    queryFn: posTransactionsService.getHeldTransactions,
  });
}

// Mutations
export function useCreateTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateTransactionPayload) =>
      posTransactionsService.createTransaction(data),
    onSuccess: () => {
      // Invalidate sales/transactions if needed
      // toast handled in component
      queryClient.invalidateQueries({ queryKey: ['pos', 'products'] }); // Update stock
    },
    onError: (error: Error) => {
        toast.error(error.message);
    },
  });
}

export function useHoldTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: posTransactionsService.holdTransaction,
    onSuccess: (response) => {
        const message = (response as any).data?.message || 'Transaksi berhasil disimpan';
      toast.success(message);
      queryClient.invalidateQueries({ queryKey: ['pos', 'held-transactions'] });
    },
    onError: (error: Error) => {
        toast.error(error.message);
    },
  });
}

export function useResumeTransaction() {
  return useMutation({
    mutationFn: (id: string) =>
      posTransactionsService.resumeHeldTransaction(id),
  });
}

export function useDeleteHeldTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: posTransactionsService.deleteHeldTransaction,
    onSuccess: (response) => {
        const message = (response as any).data?.message || 'Transaksi tersimpan dihapus';
      toast.success(message);
      queryClient.invalidateQueries({ queryKey: ['pos', 'held-transactions'] });
    },
    onError: (error: Error) => {
        toast.error(error.message);
    },
  });
}

export function useCreatePosPayment() {
  return useMutation({
    mutationFn: (data: CreatePaymentPayload) =>
      posPaymentsService.createPayment(data),
    onError: (error: Error) => {
        toast.error(error.message);
    },
  });
}

export function usePosAccounts() {
  return useQuery({
    queryKey: ['pos', 'accounts'],
    queryFn: posPaymentsService.getAccounts,
  });
}

export function usePosTransactions(params: any) {
  return useQuery({
    queryKey: ['pos', 'transactions', params],
    queryFn: () => posTransactionsService.getTransactions(params),
    enabled: params.enabled,
  });
}
