import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { productsService } from '@/services/products.service';
import { useAuthStore } from '@/stores/auth.store';
import { toast } from 'sonner';
import {
  QueryProductsValues,
  CreateVariantValues,
  UpdateVariantValues,
} from '@bizflow/types';
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

export function useLowStockProducts(params?: {
  page?: number;
  pageSize?: number;
}) {
  const token = useAuthStore((state) => state.accessToken);

  return useQuery({
    queryKey: ['products', 'low-stock', params],
    queryFn: () => productsService.getLowStock(params),
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

// ========================================
// Variants
// ========================================

export function useProductVariants(productId?: string) {
  const token = useAuthStore((state) => state.accessToken);

  return useQuery({
    queryKey: ['products', productId, 'variants'],
    queryFn: () => productsService.getVariants(productId!),
    enabled: !!token && !!productId,
  });
}

export function useCreateVariant(productId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateVariantValues) =>
      productsService.createVariant(productId, data),
    onSuccess: () => {
      toast.success('Varian berhasil dibuat');
      queryClient.invalidateQueries({
        queryKey: ['products', productId, 'variants'],
      });
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useUpdateVariant(productId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { id: string; values: UpdateVariantValues }) =>
      productsService.updateVariant(data.id, data.values),
    onSuccess: () => {
      toast.success('Varian berhasil diperbarui');
      queryClient.invalidateQueries({
        queryKey: ['products', productId, 'variants'],
      });
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useDeleteVariant(productId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => productsService.deleteVariant(id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['products', productId, 'variants'],
      });
      toast.success('Varian berhasil dihapus');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Gagal menghapus variant');
    },
  });
}

export function useGenerateVariantSku(productId: string) {
  return useMutation({
    mutationFn: () => productsService.generateVariantSku(productId),
  });
}
