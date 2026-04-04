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
    onSuccess: async (response) => {
      const message = (response as any).data?.message || 'Produk berhasil dibuat';
      await queryClient.invalidateQueries({ queryKey: ['products'] });
      router.back();
      toast.success(message);
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
    onSuccess: async (response) => {
      const message = (response as any).data?.message || 'Produk berhasil diperbarui';
      await queryClient.invalidateQueries({ queryKey: ['products'] });
      await queryClient.invalidateQueries({ queryKey: ['product', id] });
      router.back();
      toast.success(message);
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
    onSuccess: async (response) => {
      const message =
        (response as any).data?.message || 'Produk berhasil dihapus';
      await queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success(message);
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
    onSuccess: async (response) => {
      const message =
        (response as any).data?.message || 'Produk berhasil dinonaktifkan';
      await queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success(message);
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
    onSuccess: async (response) => {
      const message = (response as any).data?.message || 'Varian berhasil dibuat';
      await queryClient.invalidateQueries({
        queryKey: ['products', productId, 'variants'],
      });
      toast.success(message);
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
    onSuccess: async (response) => {
      const message = (response as any).data?.message || 'Varian berhasil diperbarui';
      await queryClient.invalidateQueries({
        queryKey: ['products', productId, 'variants'],
      });
      toast.success(message);
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
    onSuccess: async (response) => {
      await queryClient.invalidateQueries({
        queryKey: ['products', productId, 'variants'],
      });
      const message = (response as any).data?.message || 'Varian berhasil dihapus';
      toast.success(message);
    },
    onError: (error: Error) => {
        toast.error(error.message);
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
    onSuccess: async (response) => {
      const message = (response as any).data?.message || 'Level harga berhasil dibuat';
      await queryClient.invalidateQueries({
        queryKey: ['products', productId, 'price-levels'],
      });
      toast.success(message);
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
    onSuccess: async (response) => {
      const message = (response as any).data?.message || 'Level harga berhasil diperbarui';
      await queryClient.invalidateQueries({
        queryKey: ['products', productId, 'price-levels'],
      });
      toast.success(message);
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
    onSuccess: async (response) => {
      const message = (response as any).data?.message || 'Level harga berhasil dihapus';
      await queryClient.invalidateQueries({
        queryKey: ['products', productId, 'price-levels'],
      });
      toast.success(message);
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}
