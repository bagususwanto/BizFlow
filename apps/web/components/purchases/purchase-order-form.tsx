'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { CalendarIcon, Trash, Plus, Loader2 } from 'lucide-react';
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
  createPurchaseOrderSchema,
  CreatePurchaseOrderValues,
} from '@bizflow/types';
import { purchaseOrdersService } from '@/services/purchase-orders.service';
import { suppliersService } from '@/services/suppliers.service';
import { productsService } from '@/services/products.service';
import {
  useCreatePurchaseOrder,
  useUpdatePurchaseOrder,
} from '@/hooks/use-purchase-orders';

interface PurchaseOrderFormProps {
  initialData?: any;
  isCustomOrderNumber?: boolean;
}

export function PurchaseOrderForm({
  initialData,
  isCustomOrderNumber = false,
}: PurchaseOrderFormProps) {
  const router = useRouter();
  const [isCalendarOpen, setIsCalendarOpen] = React.useState(false);

  // Initialize hooks unconditionally
  const createMutation = useCreatePurchaseOrder();
  // Safe to call even without initialData; we just won't call mutate if we don't need it
  const updateMutation = useUpdatePurchaseOrder(initialData?.id || '');

  const form = useForm<z.input<typeof createPurchaseOrderSchema>>({
    resolver: zodResolver(createPurchaseOrderSchema),
    defaultValues: {
      orderNumber: '',
      supplierId: '',
      expectedDate: undefined,
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

  // Fetch suppliers
  const { data: suppliers } = useQuery({
    queryKey: ['suppliers', 'active'],
    queryFn: () => suppliersService.getActiveList(),
  });

  // Fetch products (variants for transactions)
  const { data: products } = useQuery({
    queryKey: ['products', 'variants', 'active'],
    queryFn: () => productsService.getActiveVariantsList(),
  });

  // Generate order number if not provided
  React.useEffect(() => {
    if ((!initialData || !initialData.orderNumber) && !isCustomOrderNumber) {
      purchaseOrdersService.generateOrderNumber().then((orderNumber) => {
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

  async function onSubmit(values: z.input<typeof createPurchaseOrderSchema>) {
    // Recalculate discountAmount to ensure consistency with discountPercent
    const items = values.items || [];
    const subtotal = items.reduce((acc, item) => {
      return acc + (item.quantity || 0) * (item.unitPrice || 0);
    }, 0);
    const discountAmount = (subtotal * (values.discountPercent || 0)) / 100;

    const data = {
      ...values,
      discountAmount,
    } as CreatePurchaseOrderValues;

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
        {/* Top Section: General Info */}
        <Card>
          <CardHeader>
            <CardTitle>Informasi Pesanan</CardTitle>
            <CardDescription>
              Informasi umum mengenai purchase order.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-6 md:grid-cols-2">
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="orderNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel optional>No. PO</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        disabled={!isCustomOrderNumber}
                        placeholder="Otomatis"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="supplierId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel required>Pemasok</FormLabel>
                    <Combobox
                      options={
                        suppliers?.map((s) => ({
                          label: `${s.name} (${s.code})`,
                          value: s.id,
                        })) || []
                      }
                      value={field.value}
                      onChange={field.onChange}
                      disabled={!!initialData?.id} // Only disable if editing existing PO
                      placeholder="Pilih Pemasok"
                      searchPlaceholder="Cari pemasok..."
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="space-y-4">
              <FormField
                control={form.control}
                name="expectedDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel optional>Tanggal Ekspektasi</FormLabel>
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
                              <span>Pilih tanggal</span>
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
                          disabled={(date) =>
                            date < new Date(new Date().setHours(0, 0, 0, 0))
                          }
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormDescription>
                      Perkiraan barang akan diterima.
                    </FormDescription>
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
              <CardTitle>Item Pesanan</CardTitle>
              <CardDescription>
                Daftar barang yang akan dipesan.
              </CardDescription>
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
              Tambah Item
            </Button>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              {/* Desktop Header */}
              <div className="hidden sm:grid grid-cols-[1fr_100px_160px_160px_50px] gap-4 items-center p-4 bg-muted/40 text-sm font-medium text-muted-foreground border-b">
                <div>Produk</div>
                <div className="text-right">Qty</div>
                <div className="text-right">Harga Satuan</div>
                <div className="text-right">Subtotal</div>
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
                              Produk
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
                                  form.setValue(
                                    `items.${index}.unitPrice`,
                                    selectedProduct.costPrice || 0,
                                  );
                                }
                              }}
                              placeholder="Pilih Produk"
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
                              Qty
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
                              Harga
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
                          Subtotal:
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
                Catatan{' '}
                <span className="text-xs font-normal text-muted-foreground">
                  (Opsional)
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
                        placeholder="Catatan tambahan untuk pemasok..."
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
              <CardTitle>Rincian Pembayaran</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
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
                      Diskon (%)
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
                <span>Potongan Diskon</span>
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
                      Pajak (%)
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
                <span>Pajak (PPN)</span>
                <span>+ {formatCurrency(taxAmount)}</span>
              </div>

              <Separator />

              <div className="flex justify-between text-lg font-bold">
                <span>Total</span>
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
            Batal
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {initialData ? 'Simpan Perubahan' : 'Buat Purchase Order'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
