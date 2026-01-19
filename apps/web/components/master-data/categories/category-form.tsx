'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQueryClient } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

import {
  Button,
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Input,
  Switch,
  Textarea,
} from '@bizflow/ui';
import {
  createCategorySchema,
  updateCategorySchema,
  type Category,
  type CreateCategoryValues,
  type UpdateCategoryValues,
  type CategoryWithRelations,
} from '@bizflow/types';
import {
  useActiveCategories,
  useCreateCategory,
  useUpdateCategory,
} from '@/hooks/use-categories';
import { useRouter } from 'next/navigation';
import { Combobox } from '@bizflow/ui';

interface CategoryFormProps {
  initialData?: CategoryWithRelations;
  isEdit?: boolean;
}

export function CategoryForm({
  initialData,
  isEdit = false,
}: CategoryFormProps) {
  const router = useRouter();

  const { data: activeCategories } = useActiveCategories();
  const createMutation = useCreateCategory();
  const updateMutation = useUpdateCategory(initialData?.id || '');

  const form = useForm<CreateCategoryValues | UpdateCategoryValues>({
    resolver: zodResolver(
      isEdit ? updateCategorySchema : createCategorySchema,
    ) as any,
    defaultValues: {
      name: initialData?.name || '',
      parentId: initialData?.parentId || null,
      description: initialData?.description || '',
      isActive: initialData?.isActive ?? true,
    },
  });

  const { isSubmitting } = form.formState;

  const onSubmit = async (
    data: CreateCategoryValues | UpdateCategoryValues,
  ) => {
    try {
      if (isEdit) {
        await updateMutation.mutateAsync(data as UpdateCategoryValues);
      } else {
        await createMutation.mutateAsync(data as CreateCategoryValues);
      }
    } catch (error) {
      // Error handling is done in hooks
    }
  };

  // Filter out current category from parent options to prevent direct self-reference
  const parentOptions =
    activeCategories?.filter((cat) => !isEdit || cat.id !== initialData?.id) ||
    [];

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid gap-6 md:grid-cols-2">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nama Kategori</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Contoh: Makanan Berat"
                    {...field}
                    value={field.value || ''}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="parentId"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Induk Kategori (Opsional)</FormLabel>
                <FormControl>
                  <Combobox
                    options={parentOptions.map((cat) => ({
                      value: cat.id,
                      label: cat.name,
                    }))}
                    value={field.value}
                    onChange={field.onChange}
                    placeholder="Pilih induk kategori"
                    searchPlaceholder="Cari kategori..."
                    emptyMessage="Kategori tidak ditemukan."
                    allowClear
                    clearLabel="-- Tidak Ada (Root) --"
                  />
                </FormControl>
                <FormDescription>
                  Kategori root adalah kategori utama tanpa induk.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Deskripsi (Opsional)</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Deskripsi singkat tentang kategori ini..."
                  className="resize-none"
                  rows={3}
                  {...field}
                  value={field.value || ''}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="isActive"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">Status Aktif</FormLabel>
                <div className="text-sm text-muted-foreground">
                  Kategori nonaktif tidak akan muncul di pilihan produk.
                </div>
              </div>
              <FormControl>
                <Switch
                  checked={field.value as boolean}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={isSubmitting}
          >
            Batal
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isEdit ? 'Simpan Perubahan' : 'Buat Kategori'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
