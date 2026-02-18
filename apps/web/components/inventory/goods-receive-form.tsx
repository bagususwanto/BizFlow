'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { CalendarIcon, Loader2 } from 'lucide-react';
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

interface GoodsReceiveFormProps {
  initialData?: any;
}

export function GoodsReceiveForm({ initialData }: GoodsReceiveFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isCalendarOpen, setIsCalendarOpen] = React.useState(false);

  const form = useForm<z.input<typeof createGoodsReceiveSchema>>({
    resolver: zodResolver(createGoodsReceiveSchema),
    defaultValues: initialData || {
      receiveNumber: '',
      purchaseOrderId: '',
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
    setIsSubmitting(true);
    try {
      await goodsReceiveService.create(data);
      toast.success('Penerimaan Barang berhasil dibuat');
      router.push('/purchases/goods-receive');
      router.refresh();
    } catch (error: any) {
      toast.error(error.message || 'Terjadi kesalahan');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Top Section */}
        <Card>
          <CardHeader>
            <CardTitle>Informasi Penerimaan</CardTitle>
            <CardDescription>
              Detail penerimaan barang dari Purchase Order.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-6 md:grid-cols-2">
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="receiveNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel optional>No. Penerimaan</FormLabel>
                    <FormControl>
                      <Input {...field} disabled placeholder="Otomatis" />
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
                    <FormLabel required>Purchase Order</FormLabel>
                    <Combobox
                      options={
                        purchaseOrders?.map((po) => ({
                          label: `${po.orderNumber} - ${po.supplier?.name}`,
                          value: po.id,
                        })) || []
                      }
                      value={field.value}
                      onChange={field.onChange}
                      disabled={!!initialData}
                      placeholder="Pilih PO"
                      searchPlaceholder="Cari PO..."
                    />
                    <FormDescription>
                      Hanya PO dengan status Ordered yang muncul.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="warehouseId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel required>Gudang Tujuan</FormLabel>
                    <Combobox
                      options={
                        warehouses?.map((w) => ({
                          label: w.name,
                          value: w.id,
                        })) || []
                      }
                      value={field.value}
                      onChange={field.onChange}
                      placeholder="Pilih Gudang"
                      searchPlaceholder="Cari gudang..."
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
                    <FormLabel optional>Tanggal Penerimaan</FormLabel>
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
                    <FormLabel optional>Catatan</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Catatan tambahan..."
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
            <CardTitle>Item Barang</CardTitle>
            <CardDescription>
              {isLoadingPO ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" /> Memuat item...
                </span>
              ) : (
                'Validasi jumlah barang yang diterima.'
              )}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <div className="hidden sm:grid grid-cols-[1fr_100px_100px_100px_1fr] gap-4 items-center p-4 bg-muted/40 text-sm font-medium text-muted-foreground border-b">
                <div>Produk</div>
                <div className="text-right">Dipesan</div>
                <div className="text-right">Sudah Diterima</div>
                <div className="text-right">Diterima Sekarang</div>
                <div className="pl-4">Catatan Item</div>
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
                      className="flex flex-col sm:grid sm:grid-cols-[1fr_100px_100px_100px_1fr] gap-4 p-4 hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex flex-col">
                        <span className="font-medium">
                          {poItem?.variant?.product?.name || 'Loading...'}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {poItem?.variant?.sku}
                        </span>
                        {/* Hidden input for ID is managed by react-hook-form via defaultValues/replace */}
                      </div>

                      <div className="flex justify-between sm:block text-right">
                        <span className="sm:hidden text-muted-foreground text-sm">
                          Dipesan:
                        </span>
                        <span>{ordered}</span>
                      </div>

                      <div className="flex justify-between sm:block text-right">
                        <span className="sm:hidden text-muted-foreground text-sm">
                          Sudah Diterima:
                        </span>
                        <span>{received}</span>
                      </div>

                      <div className="flex justify-between sm:block items-center">
                        <span className="sm:hidden text-muted-foreground text-sm mr-2">
                          Terima:
                        </span>
                        <FormField
                          control={form.control}
                          name={`items.${index}.receivedQty`}
                          render={({ field }) => (
                            <FormItem className="space-y-0">
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

                      <div className="mt-2 sm:mt-0">
                        <FormField
                          control={form.control}
                          name={`items.${index}.notes`}
                          render={({ field }) => (
                            <FormItem className="space-y-0">
                              <FormControl>
                                <Input
                                  className="h-8"
                                  placeholder="Catatan..."
                                  {...field}
                                  value={field.value || ''}
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
                    Pilih Purchase Order terlebih dahulu untuk melihat item.
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
            Batal
          </Button>
          <Button type="submit" disabled={isSubmitting || fields.length === 0}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Proses Penerimaan
          </Button>
        </div>
      </form>
    </Form>
  );
}
