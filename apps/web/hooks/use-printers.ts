import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { printersService } from '@/services/printers.service';
import { useAuthStore } from '@/stores/auth.store';
import { toast } from 'sonner';
import { QueryPrintersValues } from '@bizflow/types';

export function usePrinters(params?: QueryPrintersValues) {
  const token = useAuthStore((state) => state.accessToken);
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['printers', params],
    queryFn: () => printersService.getAll(params),
    enabled: !!token,
    placeholderData: (previousData) => previousData,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => printersService.delete(id),
    onSuccess: () => {
      toast.success('Printer berhasil dihapus');
      queryClient.invalidateQueries({ queryKey: ['printers'] });
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const testPrintMutation = useMutation({
    mutationFn: (id: string) => printersService.testPrint(id),
    onSuccess: () => {
      toast.success('Test print berhasil dikirim');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const openDrawerMutation = useMutation({
    mutationFn: (id: string) => printersService.openCashDrawer(id),
    onSuccess: () => {
      toast.success('Cash drawer berhasil dibuka');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  return {
    printers: query.data?.data || [],
    meta: query.data?.meta,
    isLoading: query.isLoading,
    isError: query.isError,
    deletePrinter: deleteMutation.mutate,
    isDeleting: deleteMutation.isPending,
    testPrint: testPrintMutation.mutate,
    isTesting: testPrintMutation.isPending,
    openDrawer: openDrawerMutation.mutate,
    isOpeningDrawer: openDrawerMutation.isPending,
    refetch: query.refetch,
  };
}

export function usePrinter(id: string) {
  const token = useAuthStore((state) => state.accessToken);

  return useQuery({
    queryKey: ['printer', id],
    queryFn: () => printersService.getById(id),
    enabled: !!token && !!id,
  });
}

export function useCreatePrinter() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: any) => printersService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['printers'] });
      toast.success('Printer berhasil dibuat');
    },
    onError: (error: any) => {
      toast.error(error instanceof Error ? error.message : 'Terjadi kesalahan');
    },
  });
}

export function useUpdatePrinter(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: any) => printersService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['printers'] });
      toast.success('Printer berhasil diperbarui');
    },
    onError: (error: any) => {
      toast.error(error instanceof Error ? error.message : 'Terjadi kesalahan');
    },
  });
}
