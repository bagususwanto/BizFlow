'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery, useQueryClient } from '@tanstack/react-query';
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
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
  createSalesOrderSchema,
  CreateSalesOrderValues,
} from '@bizflow/types';
import { salesOrdersService } from '@/services/sales-orders.service';
import { productsService } from '@/services/products.service';
import { customersService } from '@/services/customers.service';
import {
  useCreateSalesOrder,
  useUpdateSalesOrder,
} from '@/hooks/use-sales-orders';
import { useTranslations } from 'next-intl';
import { useAuthStore } from '@/stores/auth.store';

interface SalesOrderFormProps {
  initialData?: any;
  isCustomOrderNumber?: boolean;
}

export function SalesOrderForm({
  initialData,
  isCustomOrderNumber = false,
}: SalesOrderFormProps) {
  const router = useRouter();
  const t = useTranslations('sales.orders');
  const [isCalendarOpen, setIsCalendarOpen] = React.useState(false);
  const [isDueDateOpen, setIsDueDateOpen] = React.useState(false);

  // Initialize hooks unconditionally
  const createMutation = useCreateSalesOrder();
  // Safe to call even without initialData; we just won't call mutate if we don't need it
  const updateMutation = useUpdateSalesOrder(initialData?.id || '');

  // We can try to get outletId from user, fallback to empty string
  const user = useAuthStore((state) => state.user);
  const userOutletId = (user as any)?.outletId || '';

  const form = useForm<z.input<typeof createSalesOrderSchema>>({
    resolver: zodResolver(createSalesOrderSchema),
    defaultValues: {
      orderNumber: '',
      customerId: '',
      outletId: userOutletId,
      orderDate: undefined,
      dueDate: undefined,
      notes: '',
      items: [
        {
          variantId: '',
          quantity: 1,
          unitPrice: 0,
          notes: '',
        },
      ],
      discountPercent: 0,
      discountAmount: 0,
      taxPercent: 0,
      status: 'draft',
      ...initialData,
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'items',
  });

  // Fetch customers
  const { data: customersResponse } = useQuery({
    queryKey: ['customers', 'active'],
    queryFn: () => customersService.getAll({ pageSize: 100 }), // adjust if needed
  });
  
  const customers = customersResponse?.data || [];

  // Fetch products (variants for transactions)
  const { data: products } = useQuery({
    queryKey: ['products', 'variants', 'active'],
    queryFn: () => productsService.getActiveVariantsList(),
  });

  // Generate order number if not provided
  React.useEffect(() => {
    if ((!initialData || !initialData.orderNumber) && !isCustomOrderNumber) {
      salesOrdersService.generateOrderNumber().then((orderNumber) => {
        form.setValue('orderNumber', orderNumber);
      });
    }
  }, [initialData, isCustomOrderNumber, form]);

  // Calculate totals
  const items = form.watch('items');
  const discountPercent = form.watch('discountPercent');
  const taxPercent = form.watch('taxPercent');

  const subtotal = items.reduce((acc, item) => {
    return acc + (item.quantity || 0) * (item.unitPrice || 0);
  }, 0);

  const discountAmount = (subtotal * (discountPercent || 0)) / 100;
  const taxableAmount = subtotal - discountAmount;
  const taxAmount = (taxableAmount * (taxPercent || 0)) / 100;
  const total = taxableAmount + taxAmount;

  async function onSubmit(values: z.input<typeof createSalesOrderSchema>) {
    // Recalculate discountAmount to ensure consistency with discountPercent
    const items = values.items || [];
    const subtotal = items.reduce((acc, item) => {
      return acc + (item.quantity || 0) * (item.unitPrice || 0);
    }, 0);
    const discountAmount = (subtotal * (values.discountPercent || 0)) / 100;

    // Provide default outletId if missing
    if (!values.outletId) {
       values.outletId = userOutletId;
    }

    const data = {
      ...values,
      discountAmount,
    } as CreateSalesOrderValues;

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
        {/* Hidden field for outletId */}
        <input type="hidden" {...form.register('outletId')} />

        {/* Top Section: General Info */}
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
                name="orderNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel optional>{t('form.soNumber')}</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        disabled={!isCustomOrderNumber}
                        placeholder={t('form.soNumberPlaceholder')}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="customerId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel optional>{t('form.customerLabel')}</FormLabel>
                    <Combobox
                      options={
                        customers?.map((c) => ({
                          label: `${c.name} (${c.code || 'No Code'})`,
                          value: c.id,
                        })) || []
                      }
                      value={field.value || ''}
                      onChange={field.onChange}
                      disabled={!!initialData?.id} // Only disable if editing existing SO
                      placeholder={t('form.customerPlaceholder')}
                      searchPlaceholder={t('filter.customerPlaceholder')}
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="space-y-4">
              <FormField
                control={form.control}
                name="orderDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel optional>{t('form.orderDate')}</FormLabel>
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
                              <span>{t('form.orderDatePlaceholder')}</span>
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
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() =>
                append({
                  variantId: '',
                  quantity: 1,
                  unitPrice: 0,
                  notes: '',
                })
              }
            >
              <Plus className="mr-2 h-4 w-4" />
              {t('form.items.addBtn')}
            </Button>
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
                    {/* Product */}
                    <div className="w-full">
                      <FormField
                        control={form.control}
                        name={`items.${index}.variantId`}
                        render={({ field }) => (
                          <FormItem className="space-y-0">
                            <label className="sm:hidden text-sm font-medium mb-1.5 block">
                              {t('form.items.product')}
                            </label>
                            <Combobox
                              options={
                                products?.map((p) => ({
                                  label: `${p.name} (${p.sku})`,
                                  value: p.id,
                                })) || []
                              }
                              value={field.value}
                              onChange={(value) => {
                                field.onChange(value);
                                const selectedProduct = products?.find(
                                  (p) => p.id === value,
                                );
                                if (selectedProduct) {
                                  // For Sales Order, default to the sellPrice or price instead of costPrice
                                  form.setValue(
                                    `items.${index}.unitPrice`,
                                    selectedProduct.sellPrice || 0,
                                  );
                                }
                              }}
                              placeholder={t('form.items.productPlaceholder')}
                              searchPlaceholder="Cari produk..."
                              className="w-full h-auto whitespace-normal text-left"
                            />
                            <FormMessage />
                          </FormItem>
                        )}
                      />
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
                              (form.watch(`items.${index}.unitPrice`) || 0),
                          )}
                        </span>
                      </div>

                      <div className="flex justify-end sm:justify-center">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => remove(index)}
                          disabled={fields.length === 1}
                          className="text-muted-foreground hover:text-destructive h-8 w-8"
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
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

              <FormField
                control={form.control}
                name="discountPercent"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between space-y-0">
                    <FormLabel
                      optional
                      className="text-sm font-normal text-muted-foreground"
                    >
                      {t('form.payment.discount')}
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        className="h-8 w-20 text-right bg-background"
                        min="0"
                        max="100"
                        {...field}
                        onChange={(e) =>
                          field.onChange(parseFloat(e.target.value) || 0)
                        }
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <div className="flex justify-between text-sm text-muted-foreground">
                <span>{t('form.payment.discountAmount')}</span>
                <span className="text-destructive">
                  - {formatCurrency(discountAmount)}
                </span>
              </div>

              <FormField
                control={form.control}
                name="taxPercent"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between space-y-0">
                    <FormLabel
                      optional
                      className="text-sm font-normal text-muted-foreground"
                    >
                      {t('form.payment.tax')}
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        className="h-8 w-20 text-right bg-background"
                        min="0"
                        max="100"
                        {...field}
                        onChange={(e) =>
                          field.onChange(parseFloat(e.target.value) || 0)
                        }
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <div className="flex justify-between text-sm text-muted-foreground">
                <span>{t('form.payment.taxAmount')}</span>
                <span>+ {formatCurrency(taxAmount)}</span>
              </div>

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
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {!isSubmitting && <Save className="mr-2 h-4 w-4" />}
            {initialData ? t('form.saveBtn') : t('form.createBtn')}
          </Button>
        </div>
      </form>
    </Form>
  );
}
