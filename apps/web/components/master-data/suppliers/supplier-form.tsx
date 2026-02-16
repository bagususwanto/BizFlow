'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import {
  createSupplierSchema,
  CreateSupplierValues,
  Supplier,
} from '@bizflow/types';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Input,
  Button,
  Card,
  CardContent,
  Switch,
  CardHeader,
  CardTitle,
  Textarea,
  Separator,
} from '@bizflow/ui';
import { useCreateSupplier, useUpdateSupplier } from '@/hooks/use-suppliers';
import { Loader2, Save, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useEffect } from 'react';

interface SupplierFormProps {
  initialData?: Supplier;
  title: string;
  description?: string;
}

export function SupplierForm({
  initialData,
  title,
  description,
}: SupplierFormProps) {
  const router = useRouter();
  const isEdit = !!initialData;

  const createMutation = useCreateSupplier();
  const updateMutation = useUpdateSupplier(initialData?.id || '');

  const form = useForm({
    resolver: zodResolver(createSupplierSchema),
    defaultValues: {
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
    },
  });

  const isLoading = createMutation.isPending || updateMutation.isPending;

  // Handle auto-generated code if creating new
  const { setValue, watch } = form;
  const matchCode = watch('code');

  useEffect(() => {
    if (!isEdit && !matchCode && !isLoading) {
      // Logic to fetch code is handled in the page component or hook if needed,
      // but commonly we let the backend generate it if empty, or fetch it here.
      // For now we will leave it empty to let backend generate or user input.
    }
  }, [isEdit, matchCode, isLoading]);

  const onSubmit = async (values: CreateSupplierValues) => {
    if (isEdit) {
      updateMutation.mutate(values, {
        onSuccess: () => {
          router.push('/master-data/suppliers');
        },
      });
    } else {
      createMutation.mutate(values, {
        onSuccess: () => {
          router.push('/master-data/suppliers');
        },
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold tracking-tight">{title}</h2>
          {description && (
            <p className="text-muted-foreground">{description}</p>
          )}
        </div>
        <Button variant="outline" asChild>
          <Link href="/master-data/suppliers">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Kembali
          </Link>
        </Button>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Informasi Dasar</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="code"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Kode Pemasok</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Otomatis jika kosong"
                          {...field}
                          disabled={isLoading}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nama Pemasok</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Nama Pemasok"
                          {...field}
                          disabled={isLoading}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Telepon</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="081234..."
                            {...field}
                            value={field.value || ''}
                            disabled={isLoading}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input
                            type="email"
                            placeholder="email@example.com"
                            {...field}
                            value={field.value || ''}
                            disabled={isLoading}
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
                      <FormLabel>Alamat</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Alamat lengkap"
                          {...field}
                          value={field.value || ''}
                          disabled={isLoading}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Informasi Keuangan</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="taxId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>NPWP</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Nomor Pokok Wajib Pajak"
                            {...field}
                            value={field.value || ''}
                            disabled={isLoading}
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
                        <FormLabel>Termin Pembayaran (Hari)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min="0"
                            placeholder="0"
                            {...field}
                            onChange={(e) =>
                              field.onChange(Number(e.target.value))
                            }
                            disabled={isLoading}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="bankName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nama Bank</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="BCA, Mandiri, dll"
                              {...field}
                              value={field.value || ''}
                              disabled={isLoading}
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
                          <FormLabel>No. Rekening</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Nomor Rekening"
                              {...field}
                              value={field.value || ''}
                              disabled={isLoading}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Status & Pengaturan</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="isActive"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">
                            Status Aktif
                          </FormLabel>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            disabled={isLoading}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            </div>
          </div>

          <div className="flex justify-end gap-4">
            <Button
              variant="outline"
              type="button"
              onClick={() => router.back()}
              disabled={isLoading}
            >
              Batal
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              <Save className="mr-2 h-4 w-4" />
              Simpan
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
