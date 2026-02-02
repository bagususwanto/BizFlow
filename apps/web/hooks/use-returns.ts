import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { posReturnsService } from '@/services/pos-returns.service';
import type {
  CreateReturnValues,
  QueryReturnsValues,
  ProcessReturnRefundValues,
  ApproveReturnValues,
  RejectReturnValues,
} from '@bizflow/types';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

export function useReturns(params: QueryReturnsValues) {
  return useQuery({
    queryKey: ['pos', 'returns', params],
    queryFn: () => posReturnsService.getReturns(params),
  });
}

export function useReturnDetail(id: string) {
  return useQuery({
    queryKey: ['pos', 'returns', id],
    queryFn: () => posReturnsService.getReturnById(id),
    enabled: !!id,
  });
}

export function useCreateReturn() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: (data: CreateReturnValues) =>
      posReturnsService.createReturn(data),
    onSuccess: (data) => {
      toast.success('Retur berhasil dibuat');
      queryClient.invalidateQueries({ queryKey: ['pos', 'returns'] });
      // Redirect to detail page
      if (data?.data?.id) {
        router.push(`/pos/returns/${data.data.id}`);
      }
    },
    onError: (error: any) => {
      toast.error(error.message || 'Gagal membuat retur');
    },
  });
}

export function useApproveReturn() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data?: ApproveReturnValues }) =>
      posReturnsService.approveReturn(id, data),
    onSuccess: (_, variables) => {
      toast.success('Retur disetujui');
      queryClient.invalidateQueries({
        queryKey: ['pos', 'returns', variables.id],
      });
      queryClient.invalidateQueries({ queryKey: ['pos', 'returns'] });
    },
    onError: (error: any) => {
      toast.error(error.message || 'Gagal menyetujui retur');
    },
  });
}

export function useRejectReturn() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: RejectReturnValues }) =>
      posReturnsService.rejectReturn(id, data),
    onSuccess: (_, variables) => {
      toast.success('Retur ditolak');
      queryClient.invalidateQueries({
        queryKey: ['pos', 'returns', variables.id],
      });
      queryClient.invalidateQueries({ queryKey: ['pos', 'returns'] });
    },
    onError: (error: any) => {
      toast.error(error.message || 'Gagal menolak retur');
    },
  });
}

export function useProcessRefund() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: ProcessReturnRefundValues;
    }) => posReturnsService.processRefund(id, data),
    onSuccess: (_, variables) => {
      toast.success('Refund berhasil diproses');
      queryClient.invalidateQueries({
        queryKey: ['pos', 'returns', variables.id],
      });
      queryClient.invalidateQueries({ queryKey: ['pos', 'returns'] });
    },
    onError: (error: any) => {
      toast.error(error.message || 'Gagal memproses refund');
    },
  });
}
