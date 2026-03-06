'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createStockOpnameSchema } from '@bizflow/types';
import type { CreateStockOpnameValues } from '@bizflow/types';

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
  CardHeader,
  CardTitle,
  CardDescription,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Textarea,
} from '@bizflow/ui';
import { useWarehouses } from '@/hooks/use-warehouses';
import { useActiveCategories } from '@/hooks/use-categories';
import {
  useCreateStockOpname,
  useGenerateOpnameNumber,
} from '@/hooks/use-stock-opnames';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';
import { Loader2, Save } from 'lucide-react';

export function StockOpnameForm() {
  const router = useRouter();
  const t = useTranslations('opname.create');
  const tCommon = useTranslations('common');

  const [isNavigating, setIsNavigating] = useState(false);

  const { warehouses = [] } = useWarehouses({ pageSize: 100 });
  const { data: categories = [] } = useActiveCategories();

  const form = useForm<CreateStockOpnameValues>({
    resolver: zodResolver(createStockOpnameSchema),
    defaultValues: {
      opnameNumber: '',
      warehouseId: '',
      categoryId: null,
      notes: '',
    },
  });

  const createMutation = useCreateStockOpname();
  const { data: generatedNumber, isFetching: isGenerating } =
    useGenerateOpnameNumber();

  // If we have an auto-generated number and an empty input, we might show it
  // or just leave it blank and let backend generate it. The schema allows optional.

  const onSubmit = async (data: CreateStockOpnameValues) => {
    // If number is empty, let backend generate it
    const payload = { ...data };
    if (!payload.opnameNumber) {
      delete payload.opnameNumber;
    }

    createMutation.mutate(payload, {
      onSuccess: (result) => {
        setIsNavigating(true);
        // Redirect to detail page to start counting
        router.push(`/inventory/opname/${result.id}`);
      },
    });
  };

  const isSubmitting = createMutation.isPending || isNavigating;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle>{t('headerTitle')}</CardTitle>
              <CardDescription>{t('headerDesc')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="opnameNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel optional>{t('form.numberLabel')}</FormLabel>
                      <FormControl>
                        <Input
                          placeholder={t('form.numberPlaceholder')}
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
                  name="warehouseId"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel required className="mb-1">
                        {t('form.warehouseLabel')}
                      </FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Warehouse..." />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {warehouses.map((w: any) => (
                            <SelectItem key={w.id} value={w.id}>
                              {w.name}
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
                  name="categoryId"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel optional className="mb-1">
                        {t('form.categoryLabel')}
                      </FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value || undefined}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Category..." />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {categories.map((c: any) => (
                            <SelectItem key={c.id} value={c.id}>
                              {c.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel optional>{t('form.notesLabel')}</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder={t('form.notesPlaceholder')}
                        className="resize-none"
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
        </div>

        <div className="flex items-center justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={isSubmitting}
          >
            {tCommon('cancel')}
          </Button>

          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                {t('form.submit')}
              </>
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
