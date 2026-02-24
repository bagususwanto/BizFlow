'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { Loader2, RefreshCw, Info, Save } from 'lucide-react';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';

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
  Combobox,
  Textarea,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Card,
  CardContent,
} from '@bizflow/ui';
import {
  createProductSchema,
  updateProductSchema,
  type CreateProductValues,
  type UpdateProductValues,
} from '@bizflow/types';
import {
  productsService,
  type ProductWithRelations,
} from '@/services/products.service';
import { useActiveCategories } from '@/hooks/use-categories';
import { useActiveUnits } from '@/hooks/use-units';
import { useBarcodeScanner } from '@/hooks/use-barcode-scanner';
import { VariantList } from './variant-list';
import { PriceLevelList } from './price-level-list';
import { MultiImageUpload } from '@/components/ui/multi-image-upload';

interface ProductFormProps {
  initialData?: ProductWithRelations;
  isEdit?: boolean;
}

export function ProductForm({ initialData, isEdit = false }: ProductFormProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('info');
  const t = useTranslations('products.form');

  const { data: categories = [], isLoading: isLoadingCategories } =
    useActiveCategories();
  const { data: units = [], isLoading: isLoadingUnits } = useActiveUnits();

  const form = useForm<CreateProductValues | UpdateProductValues>({
    resolver: zodResolver(
      isEdit ? updateProductSchema : createProductSchema,
    ) as any,
    defaultValues: isEdit
      ? {
          name: initialData?.name || '',
          sku: initialData?.sku || '',
          barcode: initialData?.barcode || '',
          categoryId: initialData?.categoryId || '',
          unitId: initialData?.unitId || '',
          description: initialData?.description || '',
          costPrice: Number(initialData?.costPrice) || 0,
          sellPrice: Number(initialData?.sellPrice) || 0,
          minStock: initialData?.minStock || 0,
          isActive: initialData?.isActive ?? true,
          isService: initialData?.isService ?? false,
          images: initialData?.images?.map((i) => i.url) || [],
        }
      : {
          name: '',
          sku: '',
          barcode: '',
          categoryId: '',
          unitId: '',
          description: '',
          costPrice: 0,
          sellPrice: 0,
          minStock: 0,
          isActive: true,
          isService: false,
          images: [],
        },
  });

  const { isSubmitting } = form.formState;
  const categoryId = form.watch('categoryId');

  // Handle barcode scanner
  useBarcodeScanner({
    onScan: (barcode) => {
      form.setValue('barcode', barcode);
      toast.success(t('messages.barcodeScanned', { barcode }));
    },
  });

  // SKU Generation logic
  const handleGenerateSku = async () => {
    if (!categoryId) {
      toast.error(t('messages.selectCategoryFirst'));
      return;
    }

    try {
      const sku = await productsService.generateSku(categoryId);
      form.setValue('sku', sku);
    } catch (error) {
      toast.error(t('messages.generateSkuFailed'));
    }
  };

  const onSubmit = async (data: CreateProductValues | UpdateProductValues) => {
    try {
      if (isEdit && initialData) {
        await productsService.update(
          initialData.id,
          data as UpdateProductValues,
        );
        toast.success(t('messages.updateSuccess'));
      } else {
        await productsService.create(data as CreateProductValues);
        toast.success(t('messages.createSuccess'));
      }

      queryClient.invalidateQueries({ queryKey: ['products'] });
      router.back();
      router.refresh();
    } catch (error: any) {
      toast.error(
        error instanceof Error ? error.message : t('messages.errorOccurred'),
      );
    }
  };

  const onInvalid = (errors: any) => {
    const errorFields = Object.keys(errors);

    const infoFields = [
      'name',
      'categoryId',
      'unitId',
      'sku',
      'barcode',
      'isService',
    ];
    if (infoFields.some((field) => errorFields.includes(field))) {
      setActiveTab('info');
      toast.error(t('messages.completeInfoTab'));
      return;
    }

    const pricingFields = ['costPrice', 'sellPrice', 'minStock'];
    if (pricingFields.some((field) => errorFields.includes(field))) {
      setActiveTab('pricing');
      toast.error(t('messages.completePricingTab'));
      return;
    }

    const mediaFields = ['images', 'description', 'isActive'];
    if (mediaFields.some((field) => errorFields.includes(field))) {
      setActiveTab('media');
      toast.error(t('messages.completeMediaTab'));
      return;
    }
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit, onInvalid)}
        className="space-y-8"
      >
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList
            className={`grid w-full ${isEdit ? 'grid-cols-5 lg:w-[600px]' : 'grid-cols-3 lg:w-[400px]'}`}
          >
            <TabsTrigger value="info">{t('tabs.info')}</TabsTrigger>
            <TabsTrigger value="pricing">{t('tabs.pricing')}</TabsTrigger>
            <TabsTrigger value="media">{t('tabs.media')}</TabsTrigger>
            {isEdit && (
              <TabsTrigger value="variants">{t('tabs.variants')}</TabsTrigger>
            )}
            {isEdit && (
              <TabsTrigger value="price-levels">
                {t('tabs.priceLevels')}
              </TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="info" className="mt-6 space-y-6">
            <Card>
              <CardContent className="pt-6 space-y-6">
                <div className="grid gap-6 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem className="col-span-2">
                        <FormLabel required>{t('fields.name')}</FormLabel>
                        <FormControl>
                          <Input
                            placeholder={t('fields.namePlaceholder')}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="categoryId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel required>{t('fields.category')}</FormLabel>
                        <Combobox
                          options={categories.map((category) => ({
                            label: category.name,
                            value: category.id,
                          }))}
                          value={field.value as string}
                          onChange={field.onChange}
                          placeholder={t('fields.categoryPlaceholder')}
                          searchPlaceholder={t('fields.categorySearch')}
                          emptyMessage={t('fields.categoryEmpty')}
                        />
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="unitId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel required>{t('fields.unit')}</FormLabel>
                        <Combobox
                          options={units.map((unit) => ({
                            label: `${unit.name} (${unit.symbol})`,
                            value: unit.id,
                          }))}
                          value={field.value as string}
                          onChange={field.onChange}
                          placeholder={t('fields.unitPlaceholder')}
                          searchPlaceholder={t('fields.unitSearch')}
                          emptyMessage={t('fields.unitEmpty')}
                        />
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="sku"
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormLabel optional>{t('fields.sku')}</FormLabel>
                        <div className="flex gap-2">
                          <FormControl>
                            <Input
                              placeholder={t('fields.skuPlaceholder')}
                              {...field}
                              value={field.value || ''}
                            />
                          </FormControl>
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            onClick={handleGenerateSku}
                            disabled={!categoryId}
                            title={t('fields.generateSkuTooltip')}
                          >
                            <RefreshCw className="h-4 w-4" />
                          </Button>
                        </div>
                        <FormDescription>{t('fields.skuDesc')}</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="barcode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel optional>{t('fields.barcode')}</FormLabel>
                        <FormControl>
                          <Input
                            placeholder={t('fields.barcodePlaceholder')}
                            {...field}
                            value={field.value || ''}
                          />
                        </FormControl>
                        <FormDescription>
                          {t('fields.barcodeDesc')}
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="isService"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">
                            {t('fields.isService')}
                          </FormLabel>
                          <div className="text-sm text-muted-foreground">
                            {t('fields.isServiceDesc')}
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
                            {t('fields.isActive')}
                          </FormLabel>
                          <div className="text-sm text-muted-foreground">
                            {t('fields.isActiveDesc')}
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
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="pricing" className="mt-6 space-y-6">
            <Card>
              <CardContent className="pt-6 grid gap-6 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="costPrice"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel required>{t('fields.costPrice')}</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <span className="absolute left-3 top-2.5 text-muted-foreground">
                            Rp
                          </span>
                          <Input
                            type="number"
                            className="pl-9"
                            {...field}
                            onChange={(e) =>
                              field.onChange(Number(e.target.value))
                            }
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="sellPrice"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel required>{t('fields.sellPrice')}</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <span className="absolute left-3 top-2.5 text-muted-foreground">
                            Rp
                          </span>
                          <Input
                            type="number"
                            className="pl-9"
                            {...field}
                            onChange={(e) =>
                              field.onChange(Number(e.target.value))
                            }
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="minStock"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel optional>{t('fields.minStock')}</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          {...field}
                          onChange={(e) =>
                            field.onChange(Number(e.target.value))
                          }
                          disabled={form.watch('isService')}
                        />
                      </FormControl>
                      <FormDescription>
                        {t('fields.minStockDesc')}
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="media" className="mt-6 space-y-6">
            <Card>
              <CardContent className="pt-6 space-y-6">
                <FormField
                  control={form.control}
                  name="images"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel optional>{t('fields.images')}</FormLabel>
                      <FormControl>
                        <MultiImageUpload
                          values={field.value || []}
                          onChange={field.onChange}
                          onRemove={(url) =>
                            field.onChange(
                              field.value?.filter((v: string) => v !== url),
                            )
                          }
                        />
                      </FormControl>
                      <FormDescription>
                        {t('fields.imagesDesc')}
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel optional>{t('fields.description')}</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder={t('fields.descriptionPlaceholder')}
                          className="min-h-[100px]"
                          {...field}
                          value={field.value || ''}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          </TabsContent>

          {isEdit && initialData && (
            <TabsContent value="variants" className="mt-6 space-y-6">
              <Card>
                <CardContent className="pt-6">
                  <VariantList productId={initialData.id} />
                </CardContent>
              </Card>
            </TabsContent>
          )}

          {isEdit && initialData && (
            <TabsContent value="price-levels" className="mt-6 space-y-6">
              <PriceLevelList productId={initialData.id} />
            </TabsContent>
          )}
        </Tabs>

        <div className="flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={isSubmitting}
          >
            {t('buttons.cancel')}
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {!isSubmitting && <Save className="mr-2 h-4 w-4" />}
            {isEdit ? t('buttons.save') : t('buttons.create')}
          </Button>
        </div>
      </form>
    </Form>
  );
}
