'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { Loader2, RefreshCw } from 'lucide-react';
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
  Textarea,
} from '@bizflow/ui';
import {
  createOutletSchema,
  updateOutletSchema,
  type CreateOutletValues,
  type UpdateOutletValues,
} from '@bizflow/types';
import { outletsService } from '@/services/outlets.service';
import type { Outlet } from '@/services/outlets.service';
import {
  useCreateOutlet,
  useUpdateOutlet,
  useGenerateOutletCode,
} from '@/hooks';

interface OutletFormProps {
  initialData?: Outlet;
  isEdit?: boolean;
}

export function OutletForm({ initialData, isEdit = false }: OutletFormProps) {
  const router = useRouter();
  const queryClient = useQueryClient();

  // Hooks for mutations
  const { mutateAsync: createOutlet, isPending: isCreating } =
    useCreateOutlet();
  const { mutateAsync: updateOutlet, isPending: isUpdating } = useUpdateOutlet(
    initialData?.id || '',
  );

  const {
    data: generatedCode,
    refetch: generateCode,
    isFetching: isGenerating,
  } = useGenerateOutletCode();

  const form = useForm<CreateOutletValues | UpdateOutletValues>({
    resolver: zodResolver(
      isEdit ? updateOutletSchema : createOutletSchema,
    ) as any,
    defaultValues: {
      code: initialData?.code || '',
      name: initialData?.name || '',
      address: initialData?.address || '',
      phone: initialData?.phone || '',
      isActive: initialData?.isActive ?? true,
    },
  });

  const { isSubmitting } = form.formState;
  const isLoading = isCreating || isUpdating || isSubmitting;

  const handleGenerateCode = async (e: React.MouseEvent) => {
    e.preventDefault();
    const res = await generateCode();
    if (res.data) {
      form.setValue('code', res.data);
    }
  };

  const onSubmit = async (data: CreateOutletValues | UpdateOutletValues) => {
    try {
      if (isEdit && initialData) {
        await updateOutlet(data as UpdateOutletValues);
      } else {
        await createOutlet(data as CreateOutletValues);
      }
      router.back();
      router.refresh();
    } catch (error: any) {
      toast.error(error instanceof Error ? error.message : 'Terjadi kesalahan');
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid gap-6 md:grid-cols-2">
          <FormField
            control={form.control}
            name="code"
            render={({ field }) => (
              <FormItem>
                <FormLabel optional>Kode Outlet</FormLabel>
                <div className="flex gap-2">
                  <FormControl>
                    <Input
                      placeholder="Generate otomatis"
                      {...field}
                      value={field.value || ''}
                      disabled={isEdit}
                      className="uppercase"
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
                <FormLabel required>Nama Outlet</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Outlet Pusat"
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
                <FormLabel optional>No. Telepon</FormLabel>
                <FormControl>
                  <Input
                    placeholder="021-1234567"
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
                  placeholder="Jl. Contoh No. 123, Jakarta Selatan"
                  className="resize-none"
                  rows={3}
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
                <FormLabel className="text-base">Status Aktif</FormLabel>
                <div className="text-sm text-muted-foreground">
                  Outlet yang nonaktif tidak dapat digunakan untuk transaksi.
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
            {isEdit ? 'Simpan Perubahan' : 'Buat Outlet'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
