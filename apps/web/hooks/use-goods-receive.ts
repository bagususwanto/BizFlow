import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { goodsReceiveService } from '@/services/goods-receive.service';
import { useAuthStore } from '@/stores/auth.store';
import { toast } from 'sonner';
import {
  QueryGoodsReceivesValues,
  CreateGoodsReceiveValues,
} from '@bizflow/types';
import { useRouter } from 'next/navigation';

export function useGoodsReceives(params?: QueryGoodsReceivesValues) {
  const token = useAuthStore((state) => state.accessToken);

  return useQuery({
    queryKey: ['goods-receives', params],
    queryFn: () => goodsReceiveService.getAll(params),
    enabled: !!token,
    placeholderData: (previousData) => previousData,
  });
}

export function useGoodsReceive(id: string) {
  const token = useAuthStore((state) => state.accessToken);

  return useQuery({
    queryKey: ['goods-receives', id],
    queryFn: () => goodsReceiveService.getById(id),
    enabled: !!token && !!id,
  });
}

export function useCreateGoodsReceive() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: (data: CreateGoodsReceiveValues) =>
      goodsReceiveService.create(data),
    onSuccess: async () => {
      toast.success('Penerimaan Barang berhasil dibuat');
      await queryClient.invalidateQueries({ queryKey: ['goods-receives'] });
      await queryClient.invalidateQueries({ queryKey: ['purchase-orders'] }); // Invalidate POs as status might change
      router.refresh();
      router.push('/purchases/goods-receive');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useDeleteGoodsReceive() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => goodsReceiveService.delete(id),
    onSuccess: () => {
      toast.success('Penerimaan Barang berhasil dihapus');
      queryClient.invalidateQueries({ queryKey: ['goods-receives'] });
      queryClient.invalidateQueries({ queryKey: ['purchase-orders'] });
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useBulkDeleteGoodsReceives() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (ids: string[]) => goodsReceiveService.bulkDelete(ids),
    onSuccess: () => {
      toast.success('Penerimaan Barang berhasil dihapus');
      queryClient.invalidateQueries({ queryKey: ['goods-receives'] });
      queryClient.invalidateQueries({ queryKey: ['purchase-orders'] });
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}
