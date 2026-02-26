'use client';

import { useForm } from 'react-hook-form';
import { useZodI18nResolver } from '@/hooks/use-zod-i18n-resolver';
import { useQueryClient } from '@tanstack/react-query';
import { Loader2, Save } from 'lucide-react';
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
  Combobox,
} from '@bizflow/ui';
import {
  createCategorySchema,
  updateCategorySchema,
  type CreateCategoryValues,
  type UpdateCategoryValues,
  type CategoryWithRelations,
} from '@bizflow/types';
import {
  useActiveCategories,
  useCreateCategory,
  useUpdateCategory,
} from '@/hooks';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';

interface CategoryFormProps {
  initialData?: CategoryWithRelations;
  isEdit?: boolean;
}

export function CategoryForm({
  initialData,
  isEdit = false,
}: CategoryFormProps) {
  const router = useRouter();
  const t = useTranslations('categories.form');

  const { data: activeCategories } = useActiveCategories();
  const createMutation = useCreateCategory();
  const updateMutation = useUpdateCategory(initialData?.id || '');

  const resolver = useZodI18nResolver(
    isEdit ? updateCategorySchema : createCategorySchema,
  );

  const form = useForm<CreateCategoryValues | UpdateCategoryValues>({
    resolver: resolver as any,
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
                <FormLabel required>{t('nameLabel')}</FormLabel>
                <FormControl>
                  <Input
                    placeholder={t('namePlaceholder')}
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
                <FormLabel optional>{t('parentLabel')}</FormLabel>
                <FormControl>
                  <Combobox
                    options={parentOptions.map((cat) => ({
                      value: cat.id,
                      label: cat.name,
                    }))}
                    value={field.value}
                    onChange={field.onChange}
                    placeholder={t('parentPlaceholder')}
                    searchPlaceholder={t('parentSearch')}
                    emptyMessage={t('parentEmpty')}
                    allowClear
                    clearLabel={t('parentClear')}
                  />
                </FormControl>
                <FormDescription>{t('parentDesc')}</FormDescription>
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
              <FormLabel optional>{t('descLabel')}</FormLabel>
              <FormControl>
                <Textarea
                  placeholder={t('descPlaceholder')}
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
                <FormLabel className="text-base">{t('statusLabel')}</FormLabel>
                <div className="text-sm text-muted-foreground">
                  {t('statusDesc')}
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
            {t('cancel')}
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {!isSubmitting && <Save className="mr-2 h-4 w-4" />}
            {isEdit ? t('save') : t('create')}
          </Button>
        </div>
      </form>
    </Form>
  );
}
