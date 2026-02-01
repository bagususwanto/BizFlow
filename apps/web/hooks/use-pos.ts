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
    onError: (error: any) => {
      toast.error(error.message || 'Gagal membuat transaksi');
    },
  });
}

export function useHoldTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: posTransactionsService.holdTransaction,
    onSuccess: () => {
      toast.success('Transaksi berhasil disimpan');
      queryClient.invalidateQueries({ queryKey: ['pos', 'held-transactions'] });
    },
    onError: (error: any) => {
      toast.error(error.message || 'Gagal menyimpan transaksi');
    },
  });
}

export function useResumeTransaction() {
  return useMutation({
    mutationFn: posTransactionsService.resumeHeldTransaction,
  });
}

export function useCreatePosPayment() {
  return useMutation({
    mutationFn: (data: CreatePaymentPayload) =>
      posPaymentsService.createPayment(data),
    onError: (error: any) => {
      toast.error(error.message || 'Pembayaran gagal');
    },
  });
}

export function usePosAccounts() {
  return useQuery({
    queryKey: ['pos', 'accounts'],
    queryFn: posPaymentsService.getAccounts,
  });
}
