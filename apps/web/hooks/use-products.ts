import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { productsService } from '@/services/products.service';
import { useAuthStore } from '@/stores/auth.store';
import { toast } from 'sonner';
import { QueryProductsValues } from '@bizflow/types';
import { useRouter } from 'next/navigation';

export function useProducts(params?: QueryProductsValues) {
  const token = useAuthStore((state) => state.accessToken);

  return useQuery({
    queryKey: ['products', params],
    queryFn: () => productsService.getAll(params),
    enabled: !!token,
    placeholderData: (previousData) => previousData,
  });
}

export function useProduct(id: string) {
  const token = useAuthStore((state) => state.accessToken);

  return useQuery({
    queryKey: ['product', id],
    queryFn: () => productsService.getById(id),
    enabled: !!token && !!id,
  });
}

export function useActiveProducts() {
  const token = useAuthStore((state) => state.accessToken);

  return useQuery({
    queryKey: ['products', 'active'],
    queryFn: () => productsService.getActiveList(),
    enabled: !!token,
  });
}

export function useLowStockProducts() {
  const token = useAuthStore((state) => state.accessToken);

  return useQuery({
    queryKey: ['products', 'low-stock'],
    queryFn: () => productsService.getLowStock(),
    enabled: !!token,
  });
}

export function useGenerateSku(categoryId?: string) {
  const token = useAuthStore((state) => state.accessToken);

  return useQuery({
    queryKey: ['products', 'generate-sku', categoryId],
    queryFn: () => productsService.generateSku(categoryId),
    enabled: !!token,
    // Don't refetch automatically, mostly manual trigger or on mount
    staleTime: 0,
  });
}

export function useCreateProduct() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: productsService.create,
    onSuccess: () => {
      toast.success('Produk berhasil dibuat');
      queryClient.invalidateQueries({ queryKey: ['products'] });
      router.back();
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useUpdateProduct(id: string) {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: (data: any) => productsService.update(id, data),
    onSuccess: () => {
      toast.success('Produk berhasil diperbarui');
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['product', id] });
      router.back();
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useDeleteProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: productsService.delete,
    onSuccess: () => {
      toast.success('Produk berhasil dinonaktifkan');
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useBulkDeleteProducts() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: productsService.bulkDelete,
    onSuccess: (_, variables) => {
      toast.success(`${variables.length} produk berhasil dinonaktifkan`);
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}
