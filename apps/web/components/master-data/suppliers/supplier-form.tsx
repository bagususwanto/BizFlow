'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
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
} from '@bizflow/ui';
import { Loader2, RefreshCw } from 'lucide-react';
import {
  useCreateSupplier,
  useUpdateSupplier,
  useGenerateSupplierCode,
} from '@/hooks/use-suppliers';

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

  const form = useForm({
    resolver: zodResolver(isEdit ? updateSupplierSchema : createSupplierSchema),
    defaultValues: isEdit
      ? {
          code: initialData?.code || '',
          name: initialData?.name || '',
          phone: initialData?.phone || '',
          email: initialData?.email || '',
          address: initialData?.address || '',
          taxId: initialData?.taxId || '',
          paymentTermDays: initialData?.paymentTermDays || 0,
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
          paymentTermDays: 0,
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
                    <FormLabel optional>Kode Pemasok</FormLabel>
                    <div className="flex gap-2">
                      <FormControl>
                        <Input
                          placeholder="Generate otomatis"
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
                    <FormLabel required>Nama Pemasok</FormLabel>
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
                    <Textarea
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
                name="paymentTermDays"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel optional>Termin Pembayaran (Hari)</FormLabel>
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
                    <FormLabel optional>Nama Bank</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="BCA, Mandiri, dll"
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
                    <FormLabel optional>No. Rekening</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Nomor Rekening"
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
                    <FormLabel className="text-base">Status Aktif</FormLabel>
                    <FormDescription>
                      Pemasok aktif dapat melakukan transaksi.
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
            {isEdit ? 'Simpan Perubahan' : 'Buat Pemasok'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
