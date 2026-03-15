'use client';

import * as React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { CalendarIcon, Loader2, Save } from 'lucide-react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { z } from 'zod';

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
  Input,
  Button,
  Textarea,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Calendar,
  cn,
  Combobox,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@bizflow/ui';
import {
  createGoodsReceiveSchema,
  CreateGoodsReceiveValues,
} from '@bizflow/types';
import { goodsReceiveService } from '@/services/goods-receive.service';
import { purchaseOrdersService } from '@/services/purchase-orders.service';
import { warehousesService } from '@/services/warehouses.service';
import { usePurchaseOrder } from '@/hooks/use-purchase-orders';
import { useCreateGoodsReceive } from '@/hooks/use-goods-receive';
import { useTranslations } from 'next-intl';

interface GoodsReceiveFormProps {
  initialData?: any;
}

export function GoodsReceiveForm({ initialData }: GoodsReceiveFormProps) {
  const t = useTranslations('purchases.goodsReceive');
  const router = useRouter();
  const searchParams = useSearchParams();
  const createMutation = useCreateGoodsReceive();
  const preselectedPOId = searchParams.get('purchaseOrderId') || '';
  const [isCalendarOpen, setIsCalendarOpen] = React.useState(false);

  const form = useForm<z.input<typeof createGoodsReceiveSchema>>({
    resolver: zodResolver(createGoodsReceiveSchema),
    defaultValues: initialData || {
      receiveNumber: '',
      purchaseOrderId: preselectedPOId,
      warehouseId: '',
      receiveDate: new Date(),
      notes: '',
      items: [],
    },
  });

  const { fields, replace } = useFieldArray({
    control: form.control,
    name: 'items',
  });

  // Watch for changes in Purchase Order selection
  const selectedPOId = form.watch('purchaseOrderId');

  // Fetch Purchase Orders for selection
  const { data: purchaseOrders } = useQuery({
    queryKey: ['purchase-orders', 'ordered'],
    queryFn: () =>
      purchaseOrdersService
        .getAll({
          page: 1,
          pageSize: 100, // Safe limit for now
          status: 'ordered', // We might miss partial ones if status isn't handled correctly?
          // The API documentation says: ordered -> received.
          // If partial, status stays ordered? Or partial?
          // Prisma schema default status enum has 'ordered', 'received', 'completed'.
          // My service implementation: `ordered` is used for partial. `received` is fully received.
          // So `ordered` is correct.
        })
        .then((res) => res.data),
  });

  // Fetch warehouses
  const { data: warehouses } = useQuery({
    queryKey: ['warehouses', 'active'],
    queryFn: () => warehousesService.getActiveList(),
  });

  // Fetch selected PO details to populate items
  const { data: poDetails, isLoading: isLoadingPO } =
    usePurchaseOrder(selectedPOId);

  // Auto-generate receive number
  React.useEffect(() => {
    if (!initialData) {
      goodsReceiveService.generateReceiveNumber().then((num) => {
        form.setValue('receiveNumber', num);
      });
    }
  }, [initialData, form]);

  // Populate items when PO details are loaded
  React.useEffect(() => {
    if (poDetails?.items && !initialData) {
      // Set supplier name in notes or display it?
      // Better to just populate items
      const items = poDetails.items.map((item) => {
        // Calculate remaining qty
        const typedItem = item as any;
        const received =
          typedItem.receiveItems?.reduce(
            (sum: number, ri: any) => sum + Number(ri.receivedQty),
            0,
          ) || 0;
        const remaining = Number(item.quantity || 0) - received;

        return {
          purchaseOrderItemId: item.id,
          receivedQty: remaining > 0 ? remaining : 0, // Default to remaining
          lotNumber: '',
          expiryDate: null,
          manufacturingDate: null,
          notes: '',
        };
      });

      // Filter out items that are fully received?
      // Maybe keeping them is better for visibility, but disable input?
      // Let's keep them but with 0 default qty.

      replace(items);
    }
  }, [poDetails, initialData, replace]);

  async function onSubmit(values: z.input<typeof createGoodsReceiveSchema>) {
    const data = values as CreateGoodsReceiveValues;
    createMutation.mutate(data);
  }

  const isSubmitting = createMutation.isPending;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Top Section */}
        <Card>
          <CardHeader>
            <CardTitle>{t('form.info.title')}</CardTitle>
            <CardDescription>{t('form.info.desc')}</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-6 md:grid-cols-2">
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="receiveNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel optional>
                      {t('form.fields.receiveNumber')}
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        disabled
                        placeholder={t('form.fields.auto')}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="purchaseOrderId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel required>
                      {t('form.fields.purchaseOrder')}
                    </FormLabel>
                    <Combobox
                      options={
                        purchaseOrders?.map((po) => ({
                          label: `${po.orderNumber} - ${po.supplier?.name}`,
                          value: po.id,
                        })) || []
                      }
                      value={field.value}
                      onChange={field.onChange}
                      disabled={!!initialData || !!preselectedPOId}
                      placeholder={t('form.fields.selectPo')}
                      searchPlaceholder={t('form.fields.searchPo')}
                    />
                    <FormDescription>{t('form.fields.poDesc')}</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="warehouseId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel required>{t('form.fields.warehouse')}</FormLabel>
                    <Combobox
                      options={
                        warehouses?.map((w) => ({
                          label: w.name,
                          value: w.id,
                        })) || []
                      }
                      value={field.value}
                      onChange={field.onChange}
                      placeholder={t('form.fields.selectWarehouse')}
                      searchPlaceholder={t('form.fields.searchWarehouse')}
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="space-y-4">
              <FormField
                control={form.control}
                name="receiveDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel optional>
                      {t('form.fields.receiveDate')}
                    </FormLabel>
                    <Popover
                      open={isCalendarOpen}
                      onOpenChange={setIsCalendarOpen}
                    >
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={'outline'}
                            className={cn(
                              'w-full pl-3 text-left font-normal',
                              !field.value && 'text-muted-foreground',
                            )}
                          >
                            {field.value ? (
                              format(new Date(field.value), 'PPP', {
                                locale: id,
                              })
                            ) : (
                              <span>{t('form.fields.selectDate')}</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          className="w-[300px]"
                          mode="single"
                          selected={
                            field.value ? new Date(field.value) : undefined
                          }
                          onSelect={(date) => {
                            field.onChange(date);
                            setIsCalendarOpen(false);
                          }}
                          disabled={(date) => date > new Date()}
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
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel optional>{t('form.fields.notes')}</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder={t('form.fields.notesPlaceholder')}
                        className="resize-none"
                        {...field}
                        value={field.value || ''}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        {/* Items Section */}
        <Card>
          <CardHeader>
            <CardTitle>{t('form.items.title')}</CardTitle>
            <CardDescription>
              {isLoadingPO ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />{' '}
                  {t('form.items.loading')}
                </span>
              ) : (
                t('form.items.desc')
              )}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              {/* Desktop Header */}
              <div className="hidden sm:grid grid-cols-[1fr_140px_140px_140px_100px] gap-4 items-center p-4 bg-muted/40 text-sm font-medium text-muted-foreground border-b">
                <div>{t('form.items.product')}</div>
                <div>{t('form.items.lotNumber')}</div>
                <div>{t('form.items.expiredAt')}</div>
                <div>{t('form.items.manufacturedAt')}</div>
                <div className="text-right">{t('form.items.receivingNow')}</div>
              </div>

              <div className="divide-y sm:divide-y-0">
                {fields.map((field, index) => {
                  const poItemId = form.getValues(
                    `items.${index}.purchaseOrderItemId`,
                  );
                  const poItem = poDetails?.items?.find(
                    (i) => i.id === poItemId,
                  ) as any;

                  // Calculate stats
                  const received =
                    poItem?.receiveItems?.reduce(
                      (sum: number, ri: any) => sum + Number(ri.receivedQty),
                      0,
                    ) || 0;
                  const ordered = Number(poItem?.quantity || 0);
                  const remaining = ordered - received;

                  return (
                    <div
                      key={field.id}
                      className="flex flex-col sm:grid sm:grid-cols-[1fr_140px_140px_140px_100px] gap-4 p-4 hover:bg-muted/50 transition-colors border-b last:border-0"
                    >
                      {/* Column 1: Product Info & Notes */}
                      <div className="flex flex-col space-y-3">
                        <div className="flex flex-col">
                          <label className="sm:hidden text-sm font-medium mb-1.5 block">
                            {t('form.items.product')}
                          </label>
                          <span className="font-medium text-sm">
                            {poItem?.variant?.product?.name || 'Loading...'}
                          </span>
                          <span className="text-xs text-muted-foreground mt-0.5">
                            {poItem?.variant?.sku} • {t('form.items.ordered')}: {ordered} • {t('form.items.received')}: {received}
                          </span>
                        </div>
                        <FormField
                          control={form.control}
                          name={`items.${index}.notes`}
                          render={({ field }) => (
                            <FormItem className="space-y-0">
                              <FormControl>
                                <Input
                                  className="h-8 text-xs"
                                  placeholder={t('form.items.notesPlaceholder')}
                                  {...field}
                                  value={field.value || ''}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      {/* Other Columns (Grid on mobile) */}
                      <div className="grid grid-cols-2 gap-4 sm:contents">
                        {/* Lot/Batch */}
                        <FormField
                          control={form.control}
                          name={`items.${index}.lotNumber`}
                          render={({ field }) => (
                            <FormItem className="space-y-0">
                              <label className="sm:hidden text-sm font-medium mb-1.5 block">
                                {t('form.items.lotNumber')}
                              </label>
                              <FormControl>
                                <Input
                                  className="h-8 text-xs"
                                  placeholder={t('form.items.lotNumberPlaceholder')}
                                  {...field}
                                  value={field.value || ''}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        {/* Expiry Date */}
                        <FormField
                          control={form.control}
                          name={`items.${index}.expiryDate`}
                          render={({ field }) => (
                            <FormItem className="space-y-0 flex flex-col">
                              <label className="sm:hidden text-sm font-medium mb-1.5 block">
                                {t('form.items.expiryDate')}
                              </label>
                              <Popover>
                                <PopoverTrigger asChild>
                                  <FormControl>
                                    <Button
                                      variant="outline"
                                      className={cn(
                                        'w-full h-8 px-3 text-left font-normal text-xs',
                                        !field.value && 'text-muted-foreground'
                                      )}
                                    >
                                      {field.value ? (
                                        format(new Date(field.value), 'PP', { locale: id })
                                      ) : (
                                        <span>{t('form.items.expiryDatePlaceholder')}</span>
                                      )}
                                      <CalendarIcon className="ml-auto h-3 w-3 opacity-50" />
                                    </Button>
                                  </FormControl>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                  <Calendar
                                    mode="single"
                                    selected={field.value ? new Date(field.value) : undefined}
                                    onSelect={field.onChange}
                                    initialFocus
                                  />
                                </PopoverContent>
                              </Popover>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        {/* Mfg Date */}
                        <FormField
                          control={form.control}
                          name={`items.${index}.manufacturingDate`}
                          render={({ field }) => (
                            <FormItem className="space-y-0 flex flex-col">
                              <label className="sm:hidden text-sm font-medium mb-1.5 block">
                                {t('form.items.manufacturedAt')}
                              </label>
                              <Popover>
                                <PopoverTrigger asChild>
                                  <FormControl>
                                    <Button
                                      variant="outline"
                                      className={cn(
                                        'w-full h-8 px-3 text-left font-normal text-xs',
                                        !field.value && 'text-muted-foreground'
                                      )}
                                    >
                                      {field.value ? (
                                        format(new Date(field.value), 'PP', { locale: id })
                                      ) : (
                                        <span>{t('form.items.manufacturingDatePlaceholder')}</span>
                                      )}
                                      <CalendarIcon className="ml-auto h-3 w-3 opacity-50" />
                                    </Button>
                                  </FormControl>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                  <Calendar
                                    mode="single"
                                    selected={field.value ? new Date(field.value) : undefined}
                                    onSelect={field.onChange}
                                    disabled={(date) => date > new Date()}
                                    initialFocus
                                  />
                                </PopoverContent>
                              </Popover>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        {/* Receive Qty */}
                        <FormField
                          control={form.control}
                          name={`items.${index}.receivedQty`}
                          render={({ field }) => (
                            <FormItem className="space-y-0">
                              <label className="sm:hidden text-sm font-medium mb-1.5 block">
                                {t('form.items.receivingNow')}
                              </label>
                              <FormControl>
                                <Input
                                  type="number"
                                  min="0"
                                  max={remaining}
                                  className="text-right h-8"
                                  {...field}
                                  onChange={(e) =>
                                    field.onChange(
                                      parseFloat(e.target.value) || 0,
                                    )
                                  }
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                  );
                })}

                {fields.length === 0 && !isLoadingPO && (
                  <div className="p-8 text-center text-muted-foreground">
                    {t('form.items.empty')}
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-4 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={isSubmitting}
          >
            {t('actions.cancel')}
          </Button>
          <Button type="submit" disabled={isSubmitting || fields.length === 0}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {!isSubmitting && <Save className="mr-2 h-4 w-4" />}
            {t('actions.submit')}
          </Button>
        </div>
      </form>
    </Form>
  );
}
