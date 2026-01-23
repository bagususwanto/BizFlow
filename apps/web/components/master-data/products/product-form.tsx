'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { Loader2, RefreshCw, Info } from 'lucide-react';
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
import { useGenerateSku } from '@/hooks/use-products';
import { useBarcodeScanner } from '@/hooks/use-barcode-scanner';
import { VariantList } from './variant-list';
import { PriceLevelList } from './price-level-list';
import { ImageUpload } from '@/components/ui/image-upload';
import { MultiImageUpload } from '@/components/ui/multi-image-upload';

interface ProductFormProps {
  initialData?: ProductWithRelations;
  isEdit?: boolean;
}

export function ProductForm({ initialData, isEdit = false }: ProductFormProps) {
  const router = useRouter();
  const queryClient = useQueryClient();

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
      toast.success('Barcode detected: ' + barcode);
    },
  });

  // SKU Generation logic
  const handleGenerateSku = async () => {
    if (!categoryId) {
      toast.error('Pilih kategori terlebih dahulu');
      return;
    }

    try {
      const sku = await productsService.generateSku(categoryId);
      form.setValue('sku', sku);
    } catch (error) {
      toast.error('Gagal generate SKU');
    }
  };

  const onSubmit = async (data: CreateProductValues | UpdateProductValues) => {
    try {
      if (isEdit && initialData) {
        await productsService.update(
          initialData.id,
          data as UpdateProductValues,
        );
        toast.success('Produk berhasil diperbarui');
      } else {
        await productsService.create(data as CreateProductValues);
        toast.success('Produk berhasil dibuat');
      }

      queryClient.invalidateQueries({ queryKey: ['products'] });
      router.back();
      router.refresh();
    } catch (error: any) {
      toast.error(error instanceof Error ? error.message : 'Terjadi kesalahan');
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <Tabs defaultValue="info" className="w-full">
          <TabsList
            className={`grid w-full ${isEdit ? 'grid-cols-5 lg:w-[600px]' : 'grid-cols-3 lg:w-[400px]'}`}
          >
            <TabsTrigger value="info">Informasi Dasar</TabsTrigger>
            <TabsTrigger value="pricing">Harga & Stok</TabsTrigger>
            <TabsTrigger value="media">Media & Lainnya</TabsTrigger>
            {isEdit && <TabsTrigger value="variants">Varian</TabsTrigger>}
            {isEdit && (
              <TabsTrigger value="price-levels">Level Harga</TabsTrigger>
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
                        <FormLabel required>Nama Produk</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Contoh: Kopi Susu Aren"
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
                        <FormLabel required>Kategori</FormLabel>
                        <Combobox
                          options={categories.map((category) => ({
                            label: category.name,
                            value: category.id,
                          }))}
                          value={field.value as string}
                          onChange={field.onChange}
                          placeholder="Pilih Kategori"
                          searchPlaceholder="Cari Kategori..."
                          emptyMessage="Kategori tidak ditemukan."
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
                        <FormLabel required>Satuan</FormLabel>
                        <Combobox
                          options={units.map((unit) => ({
                            label: `${unit.name} (${unit.symbol})`,
                            value: unit.id,
                          }))}
                          value={field.value as string}
                          onChange={field.onChange}
                          placeholder="Pilih Satuan"
                          searchPlaceholder="Cari Satuan..."
                          emptyMessage="Satuan tidak ditemukan."
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
                        <FormLabel optional>SKU</FormLabel>
                        <div className="flex gap-2">
                          <FormControl>
                            <Input
                              placeholder="Generate otomatis..."
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
                            title="Generate SKU Otomatis"
                          >
                            <RefreshCw className="h-4 w-4" />
                          </Button>
                        </div>
                        <FormDescription>
                          Akan otomatis dibuat jika dikosongkan
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="barcode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel optional>Barcode</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Scan barcode..."
                            {...field}
                            value={field.value || ''}
                          />
                        </FormControl>
                        <FormDescription>
                          Scan barcode produk jika ada
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
                            Produk Jasa
                          </FormLabel>
                          <div className="text-sm text-muted-foreground">
                            Aktifkan jika ini adalah jasa (tidak punya stok)
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
                      <FormLabel required>Harga Modal</FormLabel>
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
                      <FormLabel required>Harga Jual</FormLabel>
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
                      <FormLabel optional>Stok Minimum</FormLabel>
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
                        Batas minimum untuk notifikasi stok menipis
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
                      <FormLabel optional>Foto Produk</FormLabel>
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
                        Format: JPG, PNG, WEBP. Maksimal 5MB.
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
                      <FormLabel optional>Deskripsi</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Deskripsi detail produk..."
                          className="min-h-[100px]"
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
                        <FormLabel className="text-base">
                          Status Aktif
                        </FormLabel>
                        <div className="text-sm text-muted-foreground">
                          Nonaktifkan produk jika tidak lagi dijual
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
            Batal
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isEdit ? 'Simpan Perubahan' : 'Buat Produk'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
