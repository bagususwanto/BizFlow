'use client';

import * as React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { CalendarIcon, Trash, Plus, Loader2, Save } from 'lucide-react';
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
  Separator,
  cn,
  formatCurrency,
  Combobox,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@bizflow/ui';
import {
  createInvoiceSchema,
  CreateInvoiceValues,
} from '@bizflow/types';
import { salesInvoicesService } from '@/services/sales-invoices.service';
import {
  useCreateSalesInvoice,
  useUpdateSalesInvoice,
} from '@/hooks/use-sales-invoices';
import { salesOrdersService } from '@/services/sales-orders.service';
import { useTranslations } from 'next-intl';

interface InvoiceFormProps {
  initialData?: any;
  isCustomInvoiceNumber?: boolean;
}

export function InvoiceForm({
  initialData,
  isCustomInvoiceNumber = false,
}: InvoiceFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const t = useTranslations('sales.invoices');
  const [isCalendarOpen, setIsCalendarOpen] = React.useState(false);
  const [isDueDateOpen, setIsDueDateOpen] = React.useState(false);

  // orderId can be pre-filled from URL query param (e.g. coming from SO detail page)
  const prefilledOrderId = searchParams.get('orderId') || '';

  // Lookup map: variantId -> { name, sku } for displaying item labels
  const [itemLabels, setItemLabels] = React.useState<Record<string, { name: string; sku: string }>>({});

  const createMutation = useCreateSalesInvoice();
  const updateMutation = useUpdateSalesInvoice(initialData?.id || '');

  const form = useForm<z.input<typeof createInvoiceSchema>>({
    resolver: zodResolver(createInvoiceSchema),
    defaultValues: {
      invoiceNumber: '',
      orderId: prefilledOrderId,
      invoiceDate: undefined,
      dueDate: undefined,
      notes: '',
      items: [],
      ...initialData,
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'items',
  });

  // Fetch confirmed Sales Orders for selection
  const { data: salesOrdersResponse } = useQuery({
    queryKey: ['sales-orders', 'confirmed'],
    queryFn: () => salesOrdersService.getAll({ status: 'confirmed' as any, page: 1, pageSize: 100 }),
  });
  const salesOrders = salesOrdersResponse?.data || [];

  // When orderId changes, populate items
  const selectedOrderId = form.watch('orderId');
  const { data: selectedOrder } = useQuery({
    queryKey: ['sales-orders', selectedOrderId],
    queryFn: () => salesOrdersService.getById(selectedOrderId),
    enabled: !!selectedOrderId,
  });

  React.useEffect(() => {
    if (selectedOrder && !initialData?.id) {
      if (selectedOrder.items && selectedOrder.items.length > 0) {
        // Reset items and populate from SO items
        form.setValue('items', []);
        remove(); // clear all existing field-array entries

        // Build lookup map of variantId -> product name & sku
        const labels: Record<string, { name: string; sku: string }> = {};
        selectedOrder.items.forEach((item: any) => {
          const productName = item.variant?.product?.name || item.variant?.name || 'Produk';
          const sku = item.variant?.product?.sku || item.variant?.sku || '';
          labels[item.variantId] = { name: productName, sku };

          append({
            orderItemId: item.id,
            variantId: item.variantId,
            quantity: Number(item.quantity) || 1,
            unitPrice: Number(item.unitPrice) || 0,
            discountAmount: Number(item.discountAmount) || 0,
            notes: item.notes || '',
          });
        });
        setItemLabels(labels);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedOrder?.id]);

  React.useEffect(() => {
    if ((!initialData || !initialData.invoiceNumber) && !isCustomInvoiceNumber) {
      salesInvoicesService.generateInvoiceNumber().then((invoiceNumber) => {
        form.setValue('invoiceNumber', invoiceNumber);
      });
    }
  }, [initialData, isCustomInvoiceNumber, form]);

  const items = form.watch('items');

  const subtotal = items.reduce((acc, item) => {
    return acc + (item.quantity || 0) * (item.unitPrice || 0);
  }, 0);

  const totalDiscount = items.reduce((acc, item) => {
    return acc + (item.discountAmount || 0);
  }, 0);

  // Example taxes
  const taxAmount = 0; 
  const total = subtotal - totalDiscount + taxAmount;

  async function onSubmit(values: z.input<typeof createInvoiceSchema>) {
    const data = {
      ...values,
    } as CreateInvoiceValues;

    if (initialData?.id) {
      updateMutation.mutate(data);
    } else {
      createMutation.mutate(data);
    }
  }

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>{t('form.generalInfo.title')}</CardTitle>
            <CardDescription>
              {t('form.generalInfo.description')}
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-6 md:grid-cols-2">
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="invoiceNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel optional>{t('form.invoiceNumber')}</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        disabled={!isCustomInvoiceNumber}
                        placeholder={t('form.invoiceNumberPlaceholder')}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="orderId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('form.salesOrderLabel')}</FormLabel>
                    <Combobox
                      options={
                        salesOrders?.map((so) => ({
                          label: so.orderNumber,
                          value: so.id,
                        })) || []
                      }
                      value={field.value || ''}
                      onChange={field.onChange}
                      disabled={!!initialData?.id || !!prefilledOrderId} // Disable if editing OR pre-filled from SO detail
                      placeholder={t('form.salesOrderPlaceholder')}
                      searchPlaceholder={t('form.salesOrderSearch')}
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="space-y-4">
              <FormField
                control={form.control}
                name="invoiceDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel optional>{t('form.invoiceDate')}</FormLabel>
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
                              <span>{t('form.invoiceDatePlaceholder')}</span>
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
                name="dueDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel optional>{t('form.dueDate')}</FormLabel>
                    <Popover
                      open={isDueDateOpen}
                      onOpenChange={setIsDueDateOpen}
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
                              <span>{t('form.dueDatePlaceholder')}</span>
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
                            setIsDueDateOpen(false);
                          }}
                          disabled={(date) => {
                            const today = new Date();
                            today.setHours(0, 0, 0, 0);
                            return date < today;
                          }}
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

        {/* Middle Section: Items */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div className="space-y-1">
              <CardTitle>{t('form.items.title')}</CardTitle>
              <CardDescription>{t('form.items.description')}</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              {/* Desktop Header */}
              <div className="hidden sm:grid grid-cols-[1fr_100px_160px_160px_50px] gap-4 items-center p-4 bg-muted/40 text-sm font-medium text-muted-foreground border-b">
                <div>{t('form.items.product')}</div>
                <div className="text-right">{t('form.items.qty')}</div>
                <div className="text-right">{t('form.items.price')}</div>
                <div className="text-right">{t('form.items.subtotal')}</div>
                <div></div>
              </div>

              {/* Items List */}
              <div className="divide-y sm:divide-y-0">
                {fields.map((field, index) => (
                  <div
                    key={field.id}
                    className="flex flex-col sm:grid sm:grid-cols-[1fr_100px_160px_160px_50px] gap-4 p-4 hover:bg-muted/50 transition-colors"
                  >
                    {/* Product info */}
                    <div className="w-full flex flex-col justify-center">
                      {(() => {
                        const variantId = form.getValues(`items.${index}.variantId`);
                        const label = itemLabels[variantId];
                        return label ? (
                          <>
                            <span className="text-sm font-medium">{label.name}</span>
                            {label.sku && (
                              <span className="text-xs text-muted-foreground">{label.sku}</span>
                            )}
                          </>
                        ) : (
                          <span className="text-sm text-muted-foreground italic">Item #{index + 1}</span>
                        );
                      })()}
                    </div>

                    {/* Qty & Price (Grid on mobile) */}
                    <div className="grid grid-cols-2 gap-4 sm:contents">
                      <FormField
                        control={form.control}
                        name={`items.${index}.quantity`}
                        render={({ field }) => (
                          <FormItem className="space-y-0">
                            <label className="sm:hidden text-sm font-medium mb-1.5 block">
                              {t('form.items.qty')}
                            </label>
                            <FormControl>
                              <Input
                                type="number"
                                min="1"
                                {...field}
                                onChange={(e) =>
                                  field.onChange(
                                    parseFloat(e.target.value) || 0,
                                  )
                                }
                                className="text-right"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name={`items.${index}.unitPrice`}
                        render={({ field }) => (
                          <FormItem className="space-y-0">
                            <label className="sm:hidden text-sm font-medium mb-1.5 block">
                              {t('form.items.price')}
                            </label>
                            <FormControl>
                              <Input
                                type="number"
                                min="0"
                                {...field}
                                onChange={(e) =>
                                  field.onChange(
                                    parseFloat(e.target.value) || 0,
                                  )
                                }
                                className="text-right"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    {/* Subtotal & Actions */}
                    <div className="flex items-center justify-between sm:justify-end sm:contents">
                      <div className="flex flex-col sm:block text-right sm:col-span-1">
                        <span className="sm:hidden text-sm text-muted-foreground mr-2">
                          {t('form.items.subtotal')}:
                        </span>
                        <span className="text-sm font-medium">
                          {formatCurrency(
                            (form.watch(`items.${index}.quantity`) || 0) *
                              (form.watch(`items.${index}.unitPrice`) || 0) - (form.watch(`items.${index}.discountAmount`) || 0),
                          )}
                        </span>
                      </div>

                      <div className="flex justify-end sm:justify-center">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => remove(index)}
                          className="text-muted-foreground hover:text-destructive h-8 w-8"
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
                {fields.length === 0 && (
                   <div className="p-8 text-center text-sm text-muted-foreground">
                      {t('form.items.empty')}
                   </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Bottom Section: Notes & Totals */}
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>
                {t('form.notes.title')}{' '}
                <span className="text-xs font-normal text-muted-foreground">
                  {t('form.notes.optional')}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Textarea
                        placeholder={t('form.notes.placeholder')}
                        className="resize-none min-h-[100px]"
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

          <Card>
            <CardHeader>
              <CardTitle>{t('form.payment.title')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">
                  {t('form.payment.subtotal')}
                </span>
                <span>{formatCurrency(subtotal)}</span>
              </div>

              {totalDiscount > 0 && (
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>{t('form.payment.discountAmount')}</span>
                  <span className="text-destructive">
                    - {formatCurrency(totalDiscount)}
                  </span>
                </div>
              )}

              <Separator />

              <div className="flex justify-between text-lg font-bold">
                <span>{t('form.payment.total')}</span>
                <span className="text-primary">{formatCurrency(total)}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-end gap-4 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={isSubmitting}
          >
            {t('form.cancelBtn')}
          </Button>
          <Button type="submit" disabled={isSubmitting || fields.length === 0}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {!isSubmitting && <Save className="mr-2 h-4 w-4" />}
            {initialData ? t('form.saveBtn') : t('form.createBtn')}
          </Button>
        </div>
      </form>
    </Form>
  );
}
