'use client';

import { useForm } from 'react-hook-form';
import { useZodI18nResolver } from '@/hooks/use-zod-i18n-resolver';
import {
  createUnitSchema,
  updateUnitSchema,
  CreateUnitValues,
  UpdateUnitValues,
  UnitOfMeasure,
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
  Combobox,
} from '@bizflow/ui';
import { Loader2, Save } from 'lucide-react';
import { useUnits, useCreateUnit, useUpdateUnit } from '@/hooks';
import { useTranslations } from 'next-intl';

interface UnitFormProps {
  initialData?: UnitOfMeasure;
  isEdit?: boolean;
}

export function UnitForm({ initialData, isEdit = false }: UnitFormProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const t = useTranslations('units.form');

  // Hooks for mutations
  const { mutateAsync: createUnit, isPending: isCreating } = useCreateUnit();
  const { mutateAsync: updateUnit, isPending: isUpdating } = useUpdateUnit(
    initialData?.id || '',
  );

  const resolver = useZodI18nResolver(
    isEdit ? updateUnitSchema : createUnitSchema,
  );

  const form = useForm<CreateUnitValues | UpdateUnitValues>({
    resolver: resolver as any,
    defaultValues: isEdit
      ? {
          name: initialData?.name || '',
          symbol: initialData?.symbol || '',
          baseUnitId: initialData?.baseUnitId || undefined,
          conversionRate: initialData?.conversionRate || undefined,
        }
      : {
          name: '',
          symbol: '',
          baseUnitId: undefined,
          conversionRate: undefined,
        },
  });

  const { isSubmitting } = form.formState;
  const isLoading = isCreating || isUpdating || isSubmitting;

  // Fetch units for base unit selection
  const { units: availableUnits } = useUnits({ pageSize: 100 });

  const watchBaseUnitId = form.watch('baseUnitId');

  const onSubmit = async (values: CreateUnitValues | UpdateUnitValues) => {
    try {
      if (isEdit && initialData) {
        await updateUnit(values);
      } else {
        await createUnit(values as CreateUnitValues);
      }

      router.back();
      router.refresh();
    } catch (error) {
      // Error handling is already done in the hooks with toast
      console.error(error);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
          name="symbol"
          render={({ field }) => (
            <FormItem>
              <FormLabel required>{t('symbolLabel')}</FormLabel>
              <FormControl>
                <Input
                  placeholder={t('symbolPlaceholder')}
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
            name="baseUnitId"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel optional>{t('baseUnitLabel')}</FormLabel>
                <FormControl>
                  <Combobox
                    options={availableUnits
                      .filter((u) => u.id !== initialData?.id)
                      .map((u) => ({
                        label: `${u.name} (${u.symbol})`,
                        value: u.id,
                      }))}
                    value={field.value}
                    onChange={(val) => field.onChange(val || undefined)}
                    placeholder={t('baseUnitPlaceholder')}
                    searchPlaceholder={t('baseUnitSearch')}
                    allowClear
                    clearLabel={t('baseUnitClear')}
                  />
                </FormControl>
                <FormDescription>{t('baseUnitDesc')}</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {watchBaseUnitId && (
            <FormField
              control={form.control}
              name="conversionRate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel required>{t('conversionLabel')}</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.0001"
                      placeholder={t('conversionPlaceholder')}
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                      value={field.value || ''}
                    />
                  </FormControl>
                  <FormDescription>
                    {t('conversionDesc', {
                      symbol: form.watch('symbol') || t('thisUnit'),
                      value: field.value || 0,
                      baseSymbol:
                        availableUnits.find((u) => u.id === watchBaseUnitId)
                          ?.symbol || '',
                    })}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
        </div>

        <div className="flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={isLoading}
          >
            {t('cancel')}
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {!isLoading && <Save className="mr-2 h-4 w-4" />}
            {isEdit ? t('save') : t('create')}
          </Button>
        </div>
      </form>
    </Form>
  );
}
