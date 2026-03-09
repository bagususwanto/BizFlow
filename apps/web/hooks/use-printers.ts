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
    onSuccess: (response) => {
        const message = (response as any).data?.message || 'Printer berhasil dihapus';
      toast.success(message);
      queryClient.invalidateQueries({ queryKey: ['printers'] });
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const testPrintMutation = useMutation({
    mutationFn: (id: string) => printersService.testPrint(id),
    onSuccess: (response) => {
        const message = (response as any).data?.message || 'Test print berhasil dikirim';
      toast.success(message);
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const openDrawerMutation = useMutation({
    mutationFn: (id: string) => printersService.openCashDrawer(id),
    onSuccess: (response) => {
        const message = (response as any).data?.message || 'Cash drawer berhasil dibuka';
      toast.success(message);
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const bulkDeleteMutation = useMutation({
    mutationFn: (ids: string[]) => printersService.bulkDelete(ids),
    onSuccess: (data) => {
        const message = (data as any).data?.message || (data as any).message || 'Printer terpilih berhasil dihapus';
      toast.success(
        message,
      );
      queryClient.invalidateQueries({ queryKey: ['printers'] });
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  return {
    printers: query.data?.data || [],
    meta: query.data?.meta,
    summary: query.data?.summary,
    isLoading: query.isLoading,
    isError: query.isError,
    deletePrinter: deleteMutation.mutate,
    isDeleting: deleteMutation.isPending,
    bulkDeletePrinters: bulkDeleteMutation.mutate,
    isBulkDeleting: bulkDeleteMutation.isPending,
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
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['printers'] });
        const message = (response as any).data?.message || 'Printer berhasil dibuat';
      toast.success(message);
    },
    onError: (error: Error) => {
        toast.error(error.message);
    },
  });
}

export function useUpdatePrinter(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: any) => printersService.update(id, data),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['printers'] });
      queryClient.invalidateQueries({ queryKey: ['printer', id] });
        const message = (response as any).data?.message || 'Printer berhasil diperbarui';
      toast.success(message);
    },
    onError: (error: Error) => {
        toast.error(error.message);
    },
  });
}

export function usePrintTransaction() {
  return useMutation({
    mutationFn: ({
      printerId,
      transactionId,
    }: {
      printerId: string;
      transactionId: string;
    }) => printersService.printTransaction(printerId, transactionId),
    onSuccess: (response) => {
        const message = (response as any).data?.message || 'Print job berhasil dikirim';
      toast.success(message);
    },
    onError: (error: Error) => {
        toast.error(error.message);
    },
  });
}

export function useDefaultPrinter(outletId?: string) {
  const token = useAuthStore((state) => state.accessToken);

  return useQuery({
    queryKey: ['printers', 'default', outletId],
    queryFn: async () => {
      if (!outletId) return null;
      const res = await printersService.getAll({
        outletId,
        isDefault: true,
        isActive: true,
        page: 1,
        limit: 1,
      } as any);
      return res.data[0] || null;
    },
    enabled: !!token && !!outletId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}
