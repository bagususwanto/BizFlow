import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { productsService } from '@/services/products.service';
import { useAuthStore } from '@/stores/auth.store';
import { toast } from 'sonner';
import {
  QueryProductsValues,
  CreateVariantValues,
  UpdateVariantValues,
  CreatePriceLevelValues,
  UpdatePriceLevelValues,
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
    onSuccess: (response) => {
      // response is ApiResponse<void>, so response.data might be undefined but response.message should be there if we follow standard structure
      // Actually standard ApiResponse usually has { data, message, meta }
      // Let's check api-response type if I could, but usually we put message in the top level or data.message
      // Based on controller, it returns successResponse({ message: ... }) which structures it as data: { message: ... }
      // So accessing response.data.message should be correct if typed as ApiResponse<any>
      // But here we typed it as ApiResponse<void>. Let's cast or trust the new return.
      const message =
        (response as any).data?.message || 'Produk berhasil dihapus';
      toast.success(message);
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
    onSuccess: (response) => {
      const message =
        (response as any).data?.message || 'Produk berhasil dinonaktifkan';
      toast.success(message);
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

// ========================================
// Price Levels
// ========================================

export function usePriceLevels(productId?: string) {
  const token = useAuthStore((state) => state.accessToken);

  return useQuery({
    queryKey: ['products', productId, 'price-levels'],
    queryFn: () => productsService.getPriceLevels(productId!),
    enabled: !!token && !!productId,
  });
}

export function useCreatePriceLevel(productId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreatePriceLevelValues) =>
      productsService.createPriceLevel(productId, data),
    onSuccess: () => {
      toast.success('Level harga berhasil dibuat');
      queryClient.invalidateQueries({
        queryKey: ['products', productId, 'price-levels'],
      });
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useUpdatePriceLevel(productId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { id: string; values: UpdatePriceLevelValues }) =>
      productsService.updatePriceLevel(data.id, data.values),
    onSuccess: () => {
      toast.success('Level harga berhasil diperbarui');
      queryClient.invalidateQueries({
        queryKey: ['products', productId, 'price-levels'],
      });
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useDeletePriceLevel(productId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => productsService.deletePriceLevel(id),
    onSuccess: () => {
      toast.success('Level harga berhasil dihapus');
      queryClient.invalidateQueries({
        queryKey: ['products', productId, 'price-levels'],
      });
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}
