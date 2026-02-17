'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery } from '@tanstack/react-query';
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
} from '@bizflow/ui';
import {
  createPurchaseOrderSchema,
  CreatePurchaseOrderValues,
} from '@bizflow/types';
import { purchaseOrdersService } from '@/services/purchase-orders.service';
import { suppliersService } from '@/services/suppliers.service';
import { productsService } from '@/services/products.service';

interface PurchaseOrderFormProps {
  initialData?: any;
  isCustomOrderNumber?: boolean;
}

export function PurchaseOrderForm({
  initialData,
  isCustomOrderNumber = false,
}: PurchaseOrderFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const form = useForm<z.input<typeof createPurchaseOrderSchema>>({
    resolver: zodResolver(createPurchaseOrderSchema),
    defaultValues: initialData || {
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

  // Fetch products
  const { data: products } = useQuery({
    queryKey: ['products', 'active'],
    queryFn: () => productsService.getActiveList(),
  });

  // Generate order number if not provided
  React.useEffect(() => {
    if (!initialData && !isCustomOrderNumber) {
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
    const data = values as CreatePurchaseOrderValues;
    setIsSubmitting(true);
    try {
      if (initialData) {
        await purchaseOrdersService.update(initialData.id, data);
        toast.success('Purchase Order berhasil diperbarui');
      } else {
        await purchaseOrdersService.create(data);
        toast.success('Purchase Order berhasil dibuat');
      }
      router.push('/purchases/orders');
      router.refresh();
    } catch (error: any) {
      toast.error(error.message || 'Terjadi kesalahan');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="grid gap-6 md:grid-cols-2">
          {/* Left Column: Order Infos */}
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
                  <FormLabel required>Supplier</FormLabel>
                  <Combobox
                    options={
                      suppliers?.map((s) => ({
                        label: `${s.name} (${s.code})`,
                        value: s.id,
                      })) || []
                    }
                    value={field.value}
                    onChange={field.onChange}
                    disabled={!!initialData}
                    placeholder="Pilih Supplier"
                    searchPlaceholder="Cari supplier..."
                  />
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="expectedDate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel optional>Tanggal Ekspektasi</FormLabel>
                  <Popover>
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
                        mode="single"
                        selected={
                          field.value ? new Date(field.value) : undefined
                        }
                        onSelect={field.onChange}
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

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel optional>Catatan</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Catatan tambahan untuk supplier..."
                      className="resize-none min-h-[100px]"
                      {...field}
                      value={field.value || ''}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Right Column: Calculations */}
          <div className="space-y-6">
            <div className="rounded-lg border bg-muted/40 p-6 space-y-4">
              <h3 className="font-semibold text-sm">Ringkasan Pesanan</h3>

              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span>{formatCurrency(subtotal)}</span>
              </div>

              <FormField
                control={form.control}
                name="discountPercent"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between space-y-0">
                    <FormLabel className="text-sm font-normal text-muted-foreground">
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
                    <FormLabel className="text-sm font-normal text-muted-foreground">
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
            </div>
          </div>
        </div>

        <Separator />

        {/* Items Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium">Item Pesanan</h3>
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
          </div>

          <div className="rounded-md border">
            {/* Table Header */}
            <div className="gap-4 sm:grid-cols-[1fr_100px_150px_150px_40px] items-center p-4 bg-muted/40 text-sm font-medium text-muted-foreground border-b hidden sm:grid">
              <div>Produk</div>
              <div className="text-right">Qty</div>
              <div className="text-right">Harga Satuan</div>
              <div className="text-right">Subtotal</div>
              <div></div>
            </div>

            <div className="p-4 sm:p-0">
              <div className="grid gap-4 sm:gap-0">
                {fields.map((field, index) => (
                  <div
                    key={field.id}
                    className="grid gap-4 sm:grid-cols-[1fr_100px_150px_150px_40px] items-start sm:items-center sm:p-4 sm:border-b last:border-0"
                  >
                    <FormField
                      control={form.control}
                      name={`items.${index}.variantId`}
                      render={({ field }) => (
                        <FormItem className="w-full">
                          <label className="sm:hidden text-sm font-medium mb-1 block">
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
                              // Auto-fill price from master data
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
                            className="w-full"
                          />
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name={`items.${index}.quantity`}
                      render={({ field }) => (
                        <FormItem>
                          <label className="sm:hidden text-sm font-medium mb-1 block">
                            Qty
                          </label>
                          <FormControl>
                            <Input
                              type="number"
                              min="1"
                              {...field}
                              onChange={(e) =>
                                field.onChange(parseFloat(e.target.value) || 0)
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
                        <FormItem>
                          <label className="sm:hidden text-sm font-medium mb-1 block">
                            Harga
                          </label>
                          <FormControl>
                            <div className="relative">
                              {/* <span className="absolute left-3 top-2.5 text-xs text-muted-foreground">Rp</span> */}
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
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="flex items-center justify-between sm:justify-end sm:block">
                      <span className="sm:hidden text-sm font-medium">
                        Subtotal
                      </span>
                      <div className="text-sm font-medium text-right sm:pr-4">
                        {formatCurrency(
                          (form.watch(`items.${index}.quantity`) || 0) *
                            (form.watch(`items.${index}.unitPrice`) || 0),
                        )}
                      </div>
                    </div>

                    <div className="flex justify-end sm:justify-center">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => remove(index)}
                        disabled={fields.length === 1}
                        className="text-muted-foreground hover:text-destructive"
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
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
