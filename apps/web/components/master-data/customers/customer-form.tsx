'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  createCustomerSchema,
  updateCustomerSchema,
  CreateCustomerValues,
  UpdateCustomerValues,
  Customer,
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
} from '@bizflow/ui';
import { Loader2, RefreshCw } from 'lucide-react';
import {
  useCreateCustomer,
  useUpdateCustomer,
  useGenerateCustomerCode,
} from '@/hooks';

interface CustomerFormProps {
  initialData?: Customer;
  isEdit?: boolean;
}

export function CustomerForm({
  initialData,
  isEdit = false,
}: CustomerFormProps) {
  const router = useRouter();
  const queryClient = useQueryClient();

  // Hooks for mutations
  const { mutateAsync: createCustomer, isPending: isCreating } =
    useCreateCustomer();
  const { mutateAsync: updateCustomer, isPending: isUpdating } =
    useUpdateCustomer(initialData?.id || '');

  const {
    data: generatedCode,
    refetch: generateCode,
    isFetching: isGenerating,
  } = useGenerateCustomerCode();

  const form = useForm<CreateCustomerValues | UpdateCustomerValues>({
    resolver: zodResolver(isEdit ? updateCustomerSchema : createCustomerSchema),
    defaultValues: isEdit
      ? {
          code: initialData?.code || '',
          name: initialData?.name || '',
          phone: initialData?.phone || '',
          email: initialData?.email || '',
          address: initialData?.address || '',
          taxId: initialData?.taxId || '',
          creditLimit:
            typeof initialData?.creditLimit === 'object'
              ? Number(initialData?.creditLimit)
              : Number(initialData?.creditLimit || 0),
          isActive: initialData?.isActive ?? true,
        }
      : {
          code: '',
          name: '',
          phone: '',
          email: '',
          address: '',
          taxId: '',
          creditLimit: 0,
          isActive: true,
        },
  });

  const { isSubmitting } = form.formState;
  const isLoading = isCreating || isUpdating || isSubmitting;

  const onSubmit = async (
    values: CreateCustomerValues | UpdateCustomerValues,
  ) => {
    try {
      if (isEdit && initialData) {
        await updateCustomer(values);
      } else {
        await createCustomer(values as CreateCustomerValues);
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
                    <FormLabel optional>Kode Pelanggan</FormLabel>
                    <div className="flex gap-2">
                      <FormControl>
                        <Input
                          placeholder="Auto-generated"
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
                          title="Generate Kode Baru"
                        >
                          <RefreshCw
                            className={`h-4 w-4 ${isGenerating ? 'animate-spin' : ''}`}
                          />
                        </Button>
                      )}
                    </div>
                    <FormDescription>
                      Akan di-generate otomatis jika kosong.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel required>Nama Pelanggan</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Nama Lengkap / Perusahaan"
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
                    <FormLabel optional>Email</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="contoh@email.com"
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
                    <FormLabel optional>Telepon</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="08123456789"
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
                  <FormLabel optional>Alamat</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Alamat lengkap"
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
                    <FormLabel optional>NPWP / Tax ID</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Nomor NPWP"
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
                name="creditLimit"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel optional>Credit Limit (Rp)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="0"
                        placeholder="0"
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                        value={field.value || 0}
                      />
                    </FormControl>
                    <FormDescription>
                      Batas maksimal hutang pelanggan. Isi 0 jika tidak terbatas
                      atau tidak ada fitur hutang.
                    </FormDescription>
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
                    <FormLabel className="text-base">Status Aktif</FormLabel>
                    <FormDescription>
                      Pelanggan aktif dapat melakukan transaksi.
                    </FormDescription>
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
            Batal
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isEdit ? 'Simpan Perubahan' : 'Buat Pelanggan'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
