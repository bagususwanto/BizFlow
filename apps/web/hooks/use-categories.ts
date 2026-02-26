import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { categoriesService } from '@/services/categories.service';
import { useAuthStore } from '@/stores/auth.store';
import { toast } from 'sonner';
import { QueryCategoriesValues } from '@bizflow/types';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';

export function useCategories(params?: QueryCategoriesValues) {
  const token = useAuthStore((state) => state.accessToken);

  return useQuery({
    queryKey: ['categories', params],
    queryFn: () => categoriesService.getAll(params),
    enabled: !!token,
    placeholderData: (previousData) => previousData,
  });
}

export function useCategoryTree() {
  const token = useAuthStore((state) => state.accessToken);

  return useQuery({
    queryKey: ['categories', 'tree'],
    queryFn: () => categoriesService.getTree(),
    enabled: !!token,
  });
}

export function useCategory(id: string) {
  const token = useAuthStore((state) => state.accessToken);

  return useQuery({
    queryKey: ['category', id],
    queryFn: () => categoriesService.getById(id),
    enabled: !!token && !!id,
  });
}

export function useActiveCategories() {
  const token = useAuthStore((state) => state.accessToken);

  return useQuery({
    queryKey: ['categories', 'active'],
    queryFn: () => categoriesService.getActiveList(),
    enabled: !!token,
  });
}

export function useCreateCategory() {
  const queryClient = useQueryClient();
  const router = useRouter();
  const t = useTranslations('categories.form.messages');

  return useMutation({
    mutationFn: categoriesService.create,
    onSuccess: () => {
      toast.success(t('createSuccess'));
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      router.back();
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useUpdateCategory(id: string) {
  const queryClient = useQueryClient();
  const router = useRouter();
  const t = useTranslations('categories.form.messages');

  return useMutation({
    mutationFn: (data: any) => categoriesService.update(id, data),
    onSuccess: () => {
      toast.success(t('updateSuccess'));
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      queryClient.invalidateQueries({ queryKey: ['category', id] });
      router.back();
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useDeleteCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: categoriesService.delete,
    onSuccess: (response) => {
      const message =
        (response as any).data?.message ||
        'Kategori berhasil dihapus/dinonaktifkan';
      toast.success(message);
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useBulkDeleteCategories() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: categoriesService.bulkDelete,
    onSuccess: (response) => {
      const message =
        (response as any).data?.message || 'Kategori berhasil dinonaktifkan';
      toast.success(message);
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useReorderCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      parentId,
      index,
    }: {
      id: string;
      parentId: string | null;
      index: number;
    }) => categoriesService.reorder(id, parentId, index),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}
