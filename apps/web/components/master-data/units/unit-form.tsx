'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  createUnitSchema,
  updateUnitSchema,
  CreateUnitValues,
  UpdateUnitValues,
  UnitOfMeasure,
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@bizflow/ui';
import { Loader2 } from 'lucide-react';
import { useUnits, useCreateUnit, useUpdateUnit } from '@/hooks';

interface UnitFormProps {
  initialData?: UnitOfMeasure;
  isEdit?: boolean;
}

export function UnitForm({ initialData, isEdit = false }: UnitFormProps) {
  const router = useRouter();
  const queryClient = useQueryClient();

  // Hooks for mutations
  const { mutateAsync: createUnit, isPending: isCreating } = useCreateUnit();
  const { mutateAsync: updateUnit, isPending: isUpdating } = useUpdateUnit(
    initialData?.id || '',
  );

  const form = useForm<CreateUnitValues | UpdateUnitValues>({
    resolver: zodResolver(isEdit ? updateUnitSchema : createUnitSchema),
    defaultValues: isEdit
      ? {
          name: initialData?.name || '',
          symbol: initialData?.symbol || '',
          baseUnitId: initialData?.baseUnitId || undefined,
          conversionRate: initialData?.conversionRate || undefined,
        }
      : {
          name: '',
          symbol: '',
          baseUnitId: undefined,
          conversionRate: undefined,
        },
  });

  const { isSubmitting } = form.formState;
  const isLoading = isCreating || isUpdating || isSubmitting;

  // Fetch units for base unit selection
  const { units: availableUnits } = useUnits({ pageSize: 100 });

  const watchBaseUnitId = form.watch('baseUnitId');

  const onSubmit = async (values: CreateUnitValues | UpdateUnitValues) => {
    try {
      if (isEdit && initialData) {
        await updateUnit(values);
      } else {
        await createUnit(values as CreateUnitValues);
      }

      router.back();
      router.refresh();
    } catch (error) {
      // Error handling is already done in the hooks with toast
      console.error(error);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel required>Nama Satuan</FormLabel>
              <FormControl>
                <Input
                  placeholder="Contoh: Kilogram"
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
          name="symbol"
          render={({ field }) => (
            <FormItem>
              <FormLabel required>Simbol</FormLabel>
              <FormControl>
                <Input
                  placeholder="Contoh: kg"
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
            name="baseUnitId"
            render={({ field }) => (
              <FormItem>
                <FormLabel optional>Base Unit</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  value={field.value || undefined}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih base unit" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="none">Tidak ada</SelectItem>
                    {availableUnits
                      .filter((u) => u.id !== initialData?.id) // Prevent selecting self as base unit
                      .map((unit) => (
                        <SelectItem key={unit.id} value={unit.id}>
                          {unit.name} ({unit.symbol})
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
                <FormDescription>
                  Satuan dasar yang menjadi acuan konversi.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {watchBaseUnitId && watchBaseUnitId !== 'none' && (
            <FormField
              control={form.control}
              name="conversionRate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel required>Nilai Konversi</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.0001"
                      placeholder="Contoh: 1000"
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                      value={field.value || ''}
                    />
                  </FormControl>
                  <FormDescription>
                    1 {form.watch('symbol') || 'satuan ini'} ={' '}
                    {field.value || 0}{' '}
                    {
                      availableUnits.find((u) => u.id === watchBaseUnitId)
                        ?.symbol
                    }
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
        </div>

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
            {isEdit ? 'Simpan Perubahan' : 'Buat Satuan'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
