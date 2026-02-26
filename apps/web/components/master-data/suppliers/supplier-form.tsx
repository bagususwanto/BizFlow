'use client';

import { useForm } from 'react-hook-form';
import { useZodI18nResolver } from '@/hooks/use-zod-i18n-resolver';
import {
  createSupplierSchema,
  updateSupplierSchema,
  CreateSupplierValues,
  UpdateSupplierValues,
  Supplier,
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@bizflow/ui';
import { Loader2, RefreshCw, Save } from 'lucide-react';
import {
  useCreateSupplier,
  useUpdateSupplier,
  useGenerateSupplierCode,
} from '@/hooks/use-suppliers';
import { useActivePaymentTerms } from '@/hooks/master-data/use-payment-terms';
import { useTranslations } from 'next-intl';

interface SupplierFormProps {
  initialData?: Supplier;
  isEdit?: boolean;
}

export function SupplierForm({
  initialData,
  isEdit = false,
}: SupplierFormProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const t = useTranslations('suppliers.form');
  const tCommon = useTranslations('common');

  // Hooks for mutations
  const { mutateAsync: createSupplier, isPending: isCreating } =
    useCreateSupplier();
  const { mutateAsync: updateSupplier, isPending: isUpdating } =
    useUpdateSupplier(initialData?.id || '');

  const {
    data: generatedCode,
    refetch: generateCode,
    isFetching: isGenerating,
  } = useGenerateSupplierCode();

  const { data: paymentTerms = [], isLoading: isLoadingPaymentTerms } =
    useActivePaymentTerms();

  const resolver = useZodI18nResolver(
    isEdit ? updateSupplierSchema : createSupplierSchema,
  );

  const form = useForm({
    resolver: resolver as any,
    defaultValues: isEdit
      ? {
          code: initialData?.code || '',
          name: initialData?.name || '',
          phone: initialData?.phone || '',
          email: initialData?.email || '',
          address: initialData?.address || '',
          taxId: initialData?.taxId || '',
          paymentTermId: initialData?.paymentTermId || '',
          bankName: initialData?.bankName || '',
          bankAccount: initialData?.bankAccount || '',
          isActive: initialData?.isActive ?? true,
        }
      : {
          code: '',
          name: '',
          phone: '',
          email: '',
          address: '',
          taxId: '',
          paymentTermId: '',
          bankName: '',
          bankAccount: '',
          isActive: true,
        },
  });

  const { isSubmitting } = form.formState;
  const isLoading = isCreating || isUpdating || isSubmitting;

  const onSubmit = async (
    values: CreateSupplierValues | UpdateSupplierValues,
  ) => {
    try {
      if (isEdit && initialData) {
        await updateSupplier(values);
      } else {
        await createSupplier(values as CreateSupplierValues);
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

            <div className="grid gap-6 md:grid-cols-2">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel optional>{t('emailLabel')}</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder={t('emailPlaceholder')}
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
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel optional>{t('phoneLabel')}</FormLabel>
                    <FormControl>
                      <Input
                        placeholder={t('phonePlaceholder')}
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
                name="taxId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel optional>{t('taxIdLabel')}</FormLabel>
                    <FormControl>
                      <Input
                        placeholder={t('taxIdPlaceholder')}
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
                name="paymentTermId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel optional>{t('paymentTermLabel')}</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value || undefined}
                      value={field.value || undefined}
                      disabled={isLoadingPaymentTerms}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue
                            placeholder={t('paymentTermPlaceholder')}
                          />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {paymentTerms.map((term: any) => (
                          <SelectItem key={term.id} value={term.id}>
                            {term.name} ({term.daysDue} hari)
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <FormField
                control={form.control}
                name="bankName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel optional>{t('bankNameLabel')}</FormLabel>
                    <FormControl>
                      <Input
                        placeholder={t('bankNamePlaceholder')}
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
                name="bankAccount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel optional>{t('bankAccountLabel')}</FormLabel>
                    <FormControl>
                      <Input
                        placeholder={t('bankAccountPlaceholder')}
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
            {isEdit ? tCommon('save') : t('create')}
          </Button>
        </div>
      </form>
    </Form>
  );
}
