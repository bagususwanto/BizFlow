'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { Loader2, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { useEffect } from 'react';

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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
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
          imageUrl: initialData?.imageUrl || '',
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
          imageUrl: '',
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
          <TabsList className="grid w-full grid-cols-3 lg:w-[400px]">
            <TabsTrigger value="info">Informasi Dasar</TabsTrigger>
            <TabsTrigger value="pricing">Harga & Stok</TabsTrigger>
            <TabsTrigger value="media">Media & Lainnya</TabsTrigger>
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
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Pilih Kategori" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {categories.map((category) => (
                              <SelectItem key={category.id} value={category.id}>
                                {category.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
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
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Pilih Satuan" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {units.map((unit) => (
                              <SelectItem key={unit.id} value={unit.id}>
                                {unit.name} ({unit.symbol})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex gap-2 items-end">
                    <FormField
                      control={form.control}
                      name="sku"
                      render={({ field }) => (
                        <FormItem className="flex-1">
                          <FormLabel required>SKU</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Generate otomatis..."
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            Kode unik produk (bisa generate otomatis)
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      className="mb-6 lg:mb-8"
                      onClick={handleGenerateSku}
                      disabled={!categoryId}
                    >
                      <RefreshCw className="h-4 w-4" />
                    </Button>
                  </div>

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
                  name="imageUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel optional>URL Gambar</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="https://..."
                          {...field}
                          value={field.value || ''}
                        />
                      </FormControl>
                      <FormDescription>
                        Masukkan URL gambar produk (upload gambar akan tersedia
                        segera)
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
