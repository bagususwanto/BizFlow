'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
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

interface OutletFormProps {
  initialData?: Outlet;
  isEdit?: boolean;
}

export function OutletForm({ initialData, isEdit = false }: OutletFormProps) {
  const router = useRouter();

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

  const onSubmit = async (data: CreateOutletValues | UpdateOutletValues) => {
    try {
      if (isEdit && initialData) {
        await outletsService.update(initialData.id, data as UpdateOutletValues);
        toast.success('Outlet berhasil diperbarui');
      } else {
        await outletsService.create(data as CreateOutletValues);
        toast.success('Outlet berhasil dibuat');
      }
      router.push('/settings/outlets');
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
                <FormLabel>Kode Outlet</FormLabel>
                <FormControl>
                  <Input
                    placeholder="OUT001"
                    {...field}
                    value={field.value || ''}
                    disabled={isEdit}
                    className="uppercase"
                  />
                </FormControl>
                <FormDescription>
                  Kode unik untuk identifikasi outlet.
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
                <FormLabel>Nama Outlet</FormLabel>
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
                <FormLabel>No. Telepon (Opsional)</FormLabel>
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
              <FormLabel>Alamat (Opsional)</FormLabel>
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
            disabled={isSubmitting}
          >
            Batal
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isEdit ? 'Simpan Perubahan' : 'Buat Outlet'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
