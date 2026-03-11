'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useCreateStockLot } from '@/hooks/use-stock-lots';
import { useWarehouses } from '@/hooks/use-warehouses';
import { useProducts } from '@/hooks/use-products';
import { Button } from '@bizflow/ui';
import { Input } from '@bizflow/ui';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@bizflow/ui';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@bizflow/ui';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@bizflow/ui';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

import { useMemo } from 'react';

import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { CalendarIcon } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger, Calendar } from '@bizflow/ui';

export function StockLotForm() {
  const t = useTranslations('inventory.lots');
  const router = useRouter();

  // Custom validation schema translating messages via hook
  const formSchema = z.object({
    variantId: z.string().min(1, t('validation.variantRequired')),
    warehouseId: z.string().min(1, t('validation.warehouseRequired')),
    lotNumber: z.string().optional(),
    initialQuantity: z.coerce.number().min(0.01, t('validation.qtyMin')),
    manufacturedAt: z.date().optional().nullable(),
    expiredAt: z.date().optional().nullable(),
  }).refine((data) => {
    if (data.manufacturedAt && data.expiredAt) {
      return data.expiredAt > data.manufacturedAt;
    }
    return true;
  }, {
    message: t('validation.expiredBeforeManufactured'),
    path: ['expiredAt'],
  });

  type FormValues = z.infer<typeof formSchema>;

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      variantId: '',
      warehouseId: '',
      lotNumber: '',
      initialQuantity: 0,
    },
  });

  const { warehouses, isLoading: isLoadingWarehouses } = useWarehouses({ isActive: true });
  const { data: productsData, isLoading: isLoadingProducts } = useProducts({ 
    page: 1, 
    pageSize: 1000,
    search: '',
    sortBy: 'name',
    sortOrder: 'asc'
  });

  // Flatten products into variants for the dropdown
  const variantOptions = useMemo(() => {
    if (!productsData?.data) return [];
    
    return productsData.data.flatMap((product) => 
      product.variants?.map((variant) => ({
        id: variant.id,
        name: `${product.name} ${variant.name !== 'Default' ? `- ${variant.name}` : ''}`,
        sku: variant.sku,
      })) || []
    );
  }, [productsData]);

  const createStockLot = useCreateStockLot();

  const onSubmit = async (data: FormValues) => {
    try {
      await createStockLot.mutateAsync({
        ...data,
        manufacturedAt: data.manufacturedAt ? data.manufacturedAt.toISOString() : null,
        expiredAt: data.expiredAt ? data.expiredAt.toISOString() : null,
      });
      
      toast.success(t('create.success', { defaultValue: 'Stock lot created successfully' }));
      router.push('/inventory/lots');
    } catch (error) {
      toast.error(t('create.error', { defaultValue: 'Failed to create stock lot' }));
      console.error('Failed to create stock lot:', error);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>{t('create.cardTitle')}</CardTitle>
            <CardDescription>{t('create.cardDesc')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="variantId"
                render={({ field }: { field: any }) => (
                  <FormItem>
                    <FormLabel>{t('create.productLabel')}</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger disabled={isLoadingProducts}>
                          <SelectValue placeholder={t('create.productPlaceholder')} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {variantOptions.map((variant) => (
                          <SelectItem key={variant.id} value={variant.id}>
                            {variant.name} ({variant.sku})
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
                name="warehouseId"
                render={({ field }: { field: any }) => (
                  <FormItem>
                    <FormLabel>{t('create.warehouseLabel')}</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger disabled={isLoadingWarehouses}>
                          <SelectValue placeholder={t('create.warehousePlaceholder')} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {warehouses?.map((warehouse) => (
                          <SelectItem key={warehouse.id} value={warehouse.id}>
                            {warehouse.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="lotNumber"
                render={({ field }: { field: any }) => (
                  <FormItem>
                    <FormLabel>{t('create.lotNumberLabel')}</FormLabel>
                    <FormControl>
                      <Input placeholder={t('create.lotNumberPlaceholder')} {...field} />
                    </FormControl>
                    <FormDescription>{t('create.lotNumberDesc')}</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="initialQuantity"
                render={({ field }: { field: any }) => (
                  <FormItem>
                    <FormLabel>{t('create.qtyLabel')}</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" placeholder={t('create.qtyPlaceholder')} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="manufacturedAt"
                render={({ field }: { field: any }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>{t('create.manufacturedAtLabel')}</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={'outline'}
                            className={cn(
                              'w-full pl-3 text-left font-normal',
                              !field.value && 'text-muted-foreground'
                            )}
                          >
                            {field.value ? (
                              format(new Date(field.value), 'PPP', { locale: id })
                            ) : (
                              <span>{t('create.manufacturedAtPlaceholder')}</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value ? new Date(field.value) : undefined}
                          onSelect={field.onChange}
                          disabled={(date) =>
                            date > new Date() || date < new Date('1900-01-01')
                          }
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="expiredAt"
                render={({ field }: { field: any }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>{t('create.expiredAtLabel')}</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={'outline'}
                            className={cn(
                              'w-full pl-3 text-left font-normal',
                              !field.value && 'text-muted-foreground'
                            )}
                          >
                            {field.value ? (
                              format(new Date(field.value), 'PPP', { locale: id })
                            ) : (
                              <span>{t('create.expiredAtPlaceholder')}</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value ? new Date(field.value) : undefined}
                          onSelect={field.onChange}
                          disabled={(date) =>
                            date < new Date('1900-01-01')
                          }
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={createStockLot.isPending}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={createStockLot.isPending}>
            {createStockLot.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {t('createLabel')}
          </Button>
        </div>
      </form>
    </Form>
  );
}
