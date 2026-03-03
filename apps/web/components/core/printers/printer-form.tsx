import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Switch,
} from '@bizflow/ui';
import {
  createPrinterSchema,
  updatePrinterSchema,
  type CreatePrinterValues,
  type UpdatePrinterValues,
} from '@bizflow/types';
import type { Printer } from '@/services/printers.service';
import { useCreatePrinter, useUpdatePrinter, useActiveOutlets } from '@/hooks';
import { useTranslations } from 'next-intl';

interface PrinterFormProps {
  initialData?: Printer;
  isEdit?: boolean;
}

export function PrinterForm({ initialData, isEdit = false }: PrinterFormProps) {
  const router = useRouter();
  const t = useTranslations('printers');
  const tCommon = useTranslations('common');

  // Hooks for mutations
  const { mutateAsync: createPrinter, isPending: isCreating } =
    useCreatePrinter();
  const { mutateAsync: updatePrinter, isPending: isUpdating } =
    useUpdatePrinter(initialData?.id || '');

  const { data: outlets, isLoading: isLoadingOutlets } = useActiveOutlets();

  const form = useForm<CreatePrinterValues | UpdatePrinterValues>({
    resolver: zodResolver(
      isEdit ? updatePrinterSchema : createPrinterSchema,
    ) as any,
    defaultValues: {
      name: initialData?.name || '',
      type: initialData?.type || 'network',
      address: initialData?.address || '',
      width: initialData?.width || 58,
      isDefault: initialData?.isDefault ?? false,
      isActive: initialData?.isActive ?? true,
      outletId: initialData?.outletId || '',
    },
  });

  // Reset form when initialData changes (important for async data loading)
  useEffect(() => {
    if (initialData) {
      form.reset({
        name: initialData.name,
        type: initialData.type,
        address: initialData.address || '',
        width: initialData.width,
        isDefault: initialData.isDefault,
        isActive: initialData.isActive,
        outletId: initialData.outletId,
      });
    }
  }, [initialData, form]);

  const { isSubmitting } = form.formState;
  const isLoading = isCreating || isUpdating || isSubmitting;
  const watchType = form.watch('type');

  // Reset address field when type changes (network vs USB have different formats)
  useEffect(() => {
    // Only reset if editing and type has changed from initial value
    if (initialData && watchType !== initialData.type) {
      form.setValue('address', '');
    }
  }, [watchType, initialData, form]);

  const onSubmit = async (data: CreatePrinterValues | UpdatePrinterValues) => {
    try {
      if (isEdit && initialData) {
        await updatePrinter(data as UpdatePrinterValues);
        toast.success(t('messages.updateSuccess'));
      } else {
        await createPrinter(data as CreatePrinterValues);
        toast.success(t('messages.createSuccess'));
      }
      router.push('/settings/printers');
      router.refresh();
    } catch (error: any) {
      toast.error(
        error instanceof Error ? error.message : t('messages.errorOccurred'),
      );
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid gap-6 md:grid-cols-2">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel required>{t('form.nameLabel')}</FormLabel>
                <FormControl>
                  <Input
                    placeholder={t('form.namePlaceholder')}
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
            name="outletId"
            render={({ field }) => (
              <FormItem>
                <FormLabel required>{t('form.outletLabel')}</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  value={field.value as string}
                  disabled={isEdit || isLoadingOutlets}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder={t('form.outletPlaceholder')} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {outlets?.map((outlet) => (
                      <SelectItem key={outlet.id} value={outlet.id}>
                        {outlet.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormDescription>{t('form.outletDesc')}</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <FormItem>
                <FormLabel required>{t('form.typeLabel')}</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  value={field.value as string}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder={t('form.typePlaceholder')} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="network">
                      {t('form.typeOptions.network')}
                    </SelectItem>
                    <SelectItem value="usb">
                      {t('form.typeOptions.usb')}
                    </SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="width"
            render={({ field }) => (
              <FormItem>
                <FormLabel required>{t('form.widthLabel')}</FormLabel>
                <Select
                  onValueChange={(val) => field.onChange(parseInt(val))}
                  value={field.value ? String(field.value) : '58'}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder={t('form.widthPlaceholder')} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="58">58mm</SelectItem>
                    <SelectItem value="80">80mm</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {watchType === 'network' && (
            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem className="md:col-span-2">
                  <FormLabel required>{t('form.addressLabelIP')}</FormLabel>
                  <FormControl>
                    <Input
                      placeholder={t('form.addressPlaceholderIP')}
                      {...field}
                      value={field.value || ''}
                    />
                  </FormControl>
                  <FormDescription>{t('form.addressDescIP')}</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          {watchType === 'usb' && (
            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem className="md:col-span-2">
                  <FormLabel>{t('form.addressLabelUSB')}</FormLabel>
                  <FormControl>
                    <Input
                      placeholder={t('form.addressPlaceholderUSB')}
                      {...field}
                      value={field.value || ''}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <FormField
            control={form.control}
            name="isDefault"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">
                    {t('form.isDefaultLabel')}
                  </FormLabel>
                  <div className="text-sm text-muted-foreground">
                    {t('form.isDefaultDesc')}
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

          <FormField
            control={form.control}
            name="isActive"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">
                    {t('form.statusLabel')}
                  </FormLabel>
                  <div className="text-sm text-muted-foreground">
                    {t('form.statusDesc')}
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
        </div>

        <div className="flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={isLoading}
          >
            {t('form.cancelBtn')}
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {!isLoading && <Save className="mr-2 h-4 w-4" />}
            {isLoading ? t('form.savingBtn') : t('form.saveBtn')}
          </Button>
        </div>
      </form>
    </Form>
  );
}
