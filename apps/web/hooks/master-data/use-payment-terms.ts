import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { paymentTermsService } from '@/services/master-data/payment-terms.service';
import { PaymentTermsQuery } from '@bizflow/types';
import { useAuthStore } from '@/stores/auth.store';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';

export function usePaymentTerms(params?: PaymentTermsQuery) {
  const token = useAuthStore((state) => state.accessToken);
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['payment-terms', params],
    queryFn: () => paymentTermsService.getAll(params),
    enabled: !!token,
    placeholderData: (previousData) => previousData,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => paymentTermsService.delete(id),
    onSuccess: (response: any) => {
      const message = response.data?.message || 'Payment term berhasil dihapus';
      toast.success(message);
      queryClient.invalidateQueries({ queryKey: ['payment-terms'] });
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const bulkDeleteMutation = useMutation({
    mutationFn: (ids: string[]) => paymentTermsService.bulkDelete(ids),
    onSuccess: (response: any) => {
      const message = response.data?.message || 'Payment term berhasil dihapus';
      toast.success(message);
      queryClient.invalidateQueries({ queryKey: ['payment-terms'] });
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  return {
    paymentTerms: query.data?.data || [],
    meta: query.data?.meta,
    summary: query.data?.summary,
    isLoading: query.isLoading,
    isError: query.isError,
    deletePaymentTerm: deleteMutation.mutate,
    isDeleting: deleteMutation.isPending,
    bulkDeletePaymentTerms: bulkDeleteMutation.mutate,
    isBulkDeleting: bulkDeleteMutation.isPending,
    refetch: query.refetch,
  };
}

export function usePaymentTerm(id: string) {
  const token = useAuthStore((state) => state.accessToken);

  return useQuery({
    queryKey: ['payment-term', id],
    queryFn: () => paymentTermsService.getById(id),
    enabled: !!token && !!id,
  });
}

export function useCreatePaymentTerm() {
  const queryClient = useQueryClient();
  const t = useTranslations('paymentTerms.form.messages');

  return useMutation({
    mutationFn: (data: Parameters<typeof paymentTermsService.create>[0]) =>
      paymentTermsService.create(data),
    onSuccess: () => {
      toast.success(t('createSuccess'));
      queryClient.invalidateQueries({ queryKey: ['payment-terms'] });
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useUpdatePaymentTerm(id: string) {
  const queryClient = useQueryClient();
  const t = useTranslations('paymentTerms.form.messages');

  return useMutation({
    mutationFn: (data: Parameters<typeof paymentTermsService.update>[1]) =>
      paymentTermsService.update(id, data),
    onSuccess: () => {
      toast.success(t('updateSuccess'));
      queryClient.invalidateQueries({ queryKey: ['payment-terms'] });
      queryClient.invalidateQueries({ queryKey: ['payment-term', id] });
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useActivePaymentTerms() {
  const token = useAuthStore((state) => state.accessToken);

  return useQuery({
    queryKey: ['payment-terms', 'active'],
    queryFn: () => paymentTermsService.getActiveList(),
    enabled: !!token,
  });
}
