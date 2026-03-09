import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { customersService, CustomersQuery } from '@/services/customers.service';
import { useAuthStore } from '@/stores/auth.store';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';

export function useCustomers(params?: CustomersQuery) {
  const token = useAuthStore((state) => state.accessToken);
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['customers', params],
    queryFn: () => customersService.getAll(params),
    enabled: !!token,
    placeholderData: (previousData) => previousData,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => customersService.delete(id),
    onSuccess: (response) => {
      const message =
        (response as any).data?.message || 'Pelanggan berhasil dihapus';
      toast.success(message);
      queryClient.invalidateQueries({ queryKey: ['customers'] });
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const bulkDeleteMutation = useMutation({
    mutationFn: (ids: string[]) => customersService.bulkDelete(ids),
    onSuccess: (response) => {
      const message =
        (response as any).data?.message || 'Pelanggan berhasil dihapus';
      toast.success(message);
      queryClient.invalidateQueries({ queryKey: ['customers'] });
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  return {
    customers: query.data?.data || [],
    meta: query.data?.meta,
    summary: query.data?.summary,
    isLoading: query.isLoading,
    isError: query.isError,
    deleteCustomer: deleteMutation.mutate,
    isDeleting: deleteMutation.isPending,
    bulkDeleteCustomers: bulkDeleteMutation.mutate,
    isBulkDeleting: bulkDeleteMutation.isPending,
    refetch: query.refetch,
  };
}

export function useCustomer(id: string) {
  const token = useAuthStore((state) => state.accessToken);

  return useQuery({
    queryKey: ['customer', id],
    queryFn: () => customersService.getById(id),
    enabled: !!token && !!id,
  });
}

export function useCreateCustomer() {
  const queryClient = useQueryClient();
  const t = useTranslations('customers.form.messages');

  return useMutation({
    mutationFn: (data: Parameters<typeof customersService.create>[0]) =>
      customersService.create(data),
    onSuccess: (response) => {
        const message = (response as any).data?.message || t('createSuccess');
      toast.success(message);
      queryClient.invalidateQueries({ queryKey: ['customers'] });
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useUpdateCustomer(id: string) {
  const queryClient = useQueryClient();
  const t = useTranslations('customers.form.messages');

  return useMutation({
    mutationFn: (data: Parameters<typeof customersService.update>[1]) =>
      customersService.update(id, data),
    onSuccess: (response) => {
        const message = (response as any).data?.message || t('updateSuccess');
      toast.success(message);
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      queryClient.invalidateQueries({ queryKey: ['customer', id] });
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useActiveCustomers() {
  const token = useAuthStore((state) => state.accessToken);

  return useQuery({
    queryKey: ['customers', 'active'],
    queryFn: () => customersService.getActiveList(),
    enabled: !!token,
  });
}

export function useCustomerFinancialInfo(id: string) {
  const token = useAuthStore((state) => state.accessToken);

  return useQuery({
    queryKey: ['customer', id, 'financial-info'],
    queryFn: () => customersService.getFinancialInfo(id),
    enabled: !!token && !!id,
  });
}

export function useGenerateCustomerCode() {
  const token = useAuthStore((state) => state.accessToken);

  return useQuery({
    queryKey: ['customer', 'generate-code'],
    queryFn: () => customersService.generateCode(),
    enabled: !!token,
    staleTime: 0,
  });
}
