'use client';

import { useForm } from 'react-hook-form';
import { useZodI18nResolver } from '@/hooks/use-zod-i18n-resolver';
import {
  createWarehouseSchema,
  updateWarehouseSchema,
  CreateWarehouseValues,
  UpdateWarehouseValues,
  Warehouse,
} from '@bizflow/types';
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
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
  Card,
  CardContent,
  Textarea,
} from '@bizflow/ui';
import { Loader2, RefreshCw, Save } from 'lucide-react';
import {
  useCreateWarehouse,
  useUpdateWarehouse,
  useGenerateWarehouseCode,
} from '@/hooks';
import { useTranslations } from 'next-intl';

interface WarehouseFormProps {
  initialData?: Warehouse;
  isEdit?: boolean;
}

export function WarehouseForm({
  initialData,
  isEdit = false,
}: WarehouseFormProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const t = useTranslations('warehouses.form');
  const tCommon = useTranslations('common');

  // Hooks for mutations
  const { mutateAsync: createWarehouse, isPending: isCreating } =
    useCreateWarehouse();
  const { mutateAsync: updateWarehouse, isPending: isUpdating } =
    useUpdateWarehouse(initialData?.id || '');

  const {
    data: generatedCode,
    refetch: generateCode,
    isFetching: isGenerating,
  } = useGenerateWarehouseCode();

  const resolver = useZodI18nResolver(
    isEdit ? updateWarehouseSchema : createWarehouseSchema,
  );

  const form = useForm<CreateWarehouseValues | UpdateWarehouseValues>({
    resolver: resolver as any,
    defaultValues: isEdit
      ? {
          code: initialData?.code || '',
          name: initialData?.name || '',
          address: initialData?.address || '',
          isDefault: initialData?.isDefault ?? false,
          isActive: initialData?.isActive ?? true,
        }
      : {
          code: '',
          name: '',
          address: '',
          isDefault: false,
          isActive: true,
        },
  });

  const { isSubmitting } = form.formState;
  const isLoading = isCreating || isUpdating || isSubmitting;

  const onSubmit = async (
    values: CreateWarehouseValues | UpdateWarehouseValues,
  ) => {
    try {
      if (isEdit && initialData) {
        await updateWarehouse(values);
      } else {
        await createWarehouse(values as CreateWarehouseValues);
      }

      router.back();
      router.refresh();
    } catch (error) {
      console.error(error);
    }
  };

  const handleGenerateCode = async (e: React.MouseEvent) => {
    e.preventDefault();
    const res = await generateCode();
    if (res.data) {
      form.setValue('code', res.data);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardContent className="pt-6 space-y-4">
            <div className="grid gap-6 md:grid-cols-2">
              <FormField
                control={form.control}
                name="code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel optional>{t('codeLabel')}</FormLabel>
                    <div className="flex gap-2">
                      <FormControl>
                        <Input
                          placeholder={t('codePlaceholder')}
                          {...field}
                          value={field.value || ''}
                          disabled={isEdit}
                        />
                      </FormControl>
                      {!isEdit && (
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          onClick={handleGenerateCode}
                          disabled={isGenerating}
                          title={t('codeGenerateBtn')}
                        >
                          <RefreshCw
                            className={`h-4 w-4 ${isGenerating ? 'animate-spin' : ''}`}
                          />
                        </Button>
                      )}
                    </div>
                    <FormDescription>{t('codeDesc')}</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

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
            </div>

            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel optional>{t('addressLabel')}</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder={t('addressPlaceholder')}
                      {...field}
                      value={field.value || ''}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid gap-6 md:grid-cols-2">
              <FormField
                control={form.control}
                name="isDefault"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">
                        {t('defaultLabel')}
                      </FormLabel>
                      <FormDescription>{t('defaultDesc')}</FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        disabled={isEdit && initialData?.isDefault} // Cannot unset default if it's the only one (handled by backend but good UX)
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="isActive"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">
                        {t('statusLabel')}
                      </FormLabel>
                      <FormDescription>{t('statusDesc')}</FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={isLoading}
          >
            {tCommon('cancel')}
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {!isLoading && <Save className="mr-2 h-4 w-4" />}
            {isEdit ? tCommon('save') : tCommon('create')}
          </Button>
        </div>
      </form>
    </Form>
  );
}
