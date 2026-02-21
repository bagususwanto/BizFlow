'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  createPaymentTermSchema,
  updatePaymentTermSchema,
  CreatePaymentTermValues,
  UpdatePaymentTermValues,
  PaymentTerm,
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
import { Loader2, Save } from 'lucide-react';
import {
  useCreatePaymentTerm,
  useUpdatePaymentTerm,
} from '@/hooks/master-data/use-payment-terms';

interface PaymentTermFormProps {
  initialData?: PaymentTerm;
  isEdit?: boolean;
}

export function PaymentTermForm({
  initialData,
  isEdit = false,
}: PaymentTermFormProps) {
  const router = useRouter();
  const queryClient = useQueryClient();

  const { mutateAsync: createPaymentTerm, isPending: isCreating } =
    useCreatePaymentTerm();
  const { mutateAsync: updatePaymentTerm, isPending: isUpdating } =
    useUpdatePaymentTerm(initialData?.id || '');

  const form = useForm({
    resolver: zodResolver(
      isEdit ? updatePaymentTermSchema : createPaymentTermSchema,
    ),
    defaultValues: isEdit
      ? {
          name: initialData?.name || '',
          daysDue: initialData?.daysDue || 0,
          description: initialData?.description || '',
          isActive: initialData?.isActive ?? true,
        }
      : {
          name: '',
          daysDue: 0,
          description: '',
          isActive: true,
        },
  });

  const { isSubmitting } = form.formState;
  const isLoading = isCreating || isUpdating || isSubmitting;

  const onSubmit = async (
    values: CreatePaymentTermValues | UpdatePaymentTermValues,
  ) => {
    try {
      if (isEdit && initialData) {
        await updatePaymentTerm(values);
      } else {
        await createPaymentTerm(values as CreatePaymentTermValues);
      }

      router.back();
      router.refresh();
    } catch (error) {
      console.error(error);
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
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel required>Nama Termin</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g., Net 30, COD"
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
                name="daysDue"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel optional>Lama Hari Jt. Tempo</FormLabel>
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
                      Berapa hari sebelum lewat waktu (Net)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel optional>Keterangan</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Informasi tambahan"
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
                    <FormDescription>
                      Termin pembayaran aktif dapat dipilih saat transaksi.
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
            {!isLoading && <Save className="mr-2 h-4 w-4" />}
            {isEdit ? 'Simpan Perubahan' : 'Buat Termin Pembayaran'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
