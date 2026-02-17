'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { CalendarIcon, Trash, Plus } from 'lucide-react';
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
  Card,
  CardContent,
  Separator,
  cn,
  formatCurrency,
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
          <div className="space-y-6">
            <Card>
              <CardContent className="pt-6">
                <div className="grid gap-4">
                  <FormField
                    control={form.control}
                    name="orderNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>No. PO</FormLabel>
                        <FormControl>
                          <Input {...field} disabled={!isCustomOrderNumber} />
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
                        <FormLabel>Supplier</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          disabled={!!initialData}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Pilih Supplier" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {suppliers?.map((supplier) => (
                              <SelectItem key={supplier.id} value={supplier.id}>
                                {supplier.name} ({supplier.code})
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
                    name="expectedDate"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Tanggal Ekspektasi</FormLabel>
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
                        <FormLabel>Catatan</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Catatan tambahan untuk supplier..."
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
          </div>

          {/* Right Column: Calculations */}
          <div className="space-y-6">
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div className="flex justify-between text-sm">
                    <span>Subtotal</span>
                    <span>{formatCurrency(subtotal)}</span>
                  </div>

                  <FormField
                    control={form.control}
                    name="discountPercent"
                    render={({ field }) => (
                      <FormItem className="flex items-center justify-between space-y-0">
                        <FormLabel className="text-sm font-normal">
                          Diskon (%)
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            className="h-8 w-20 text-right"
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
                    <span>- {formatCurrency(discountAmount)}</span>
                  </div>

                  <FormField
                    control={form.control}
                    name="taxPercent"
                    render={({ field }) => (
                      <FormItem className="flex items-center justify-between space-y-0">
                        <FormLabel className="text-sm font-normal">
                          Pajak (%)
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            className="h-8 w-20 text-right"
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
                    <span>{formatCurrency(total)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

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
            <div className="p-4">
              <div className="grid gap-4">
                {fields.map((field, index) => (
                  <div
                    key={field.id}
                    className="grid gap-4 sm:grid-cols-[1fr_100px_150px_150px_auto] items-start"
                  >
                    <FormField
                      control={form.control}
                      name={`items.${index}.variantId`}
                      render={({ field }) => (
                        <FormItem>
                          {index === 0 && <FormLabel>Produk</FormLabel>}
                          <Select
                            onValueChange={(value) => {
                              field.onChange(value);
                              // Auto-fill price logic could go here if variant has default cost price
                              // For now simplified
                            }}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Pilih Produk" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {products?.map((product) => (
                                <SelectItem
                                  key={product.id}
                                  value={product.id} // Assuming logic to handle variant selection
                                >
                                  {product.name} ({product.sku})
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
                      name={`items.${index}.quantity`}
                      render={({ field }) => (
                        <FormItem>
                          {index === 0 && <FormLabel>Qty</FormLabel>}
                          <FormControl>
                            <Input
                              type="number"
                              min="1"
                              {...field}
                              onChange={(e) =>
                                field.onChange(parseFloat(e.target.value) || 0)
                              }
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
                          {index === 0 && <FormLabel>Harga Satuan</FormLabel>}
                          <FormControl>
                            <Input
                              type="number"
                              min="0"
                              {...field}
                              onChange={(e) =>
                                field.onChange(parseFloat(e.target.value) || 0)
                              }
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="pt-2 sm:pt-0">
                      {index === 0 && (
                        <span className="mb-2 block text-sm font-medium">
                          Subtotal
                        </span>
                      )}
                      <div className="flex h-10 items-center text-sm font-medium">
                        {formatCurrency(
                          (form.watch(`items.${index}.quantity`) || 0) *
                            (form.watch(`items.${index}.unitPrice`) || 0),
                        )}
                      </div>
                    </div>

                    <div className="pt-2 sm:pt-0">
                      {index === 0 && <div className="h-6 mb-2" />}
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => remove(index)}
                        disabled={fields.length === 1}
                      >
                        <Trash className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

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
            {isSubmitting
              ? 'Menyimpan...'
              : initialData
                ? 'Simpan Perubahan'
                : 'Buat Purchase Order'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
