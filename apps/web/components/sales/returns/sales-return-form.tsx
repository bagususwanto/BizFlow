'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  createSalesReturnSchema,
  CreateSalesReturnValues,
} from '@bizflow/types';
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
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
  Textarea,
  Badge,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Checkbox,
} from '@bizflow/ui';
import {
  Loader2,
  Save,
  Trash,
  Plus,
  ArrowRight,
  Search,
  CheckCircle,
} from 'lucide-react';
import { useCreateSalesReturn } from '@/hooks/use-sales-returns';
import { useSalesOrders, useSalesOrder } from '@/hooks/use-sales-orders';
import { toast } from 'sonner';

import { salesReturnsService } from '@/services/sales-returns.service';
import { useTranslations } from 'next-intl';

export function SalesReturnForm() {
  const t = useTranslations('sales.returns.form');
  const router = useRouter();
  const createMutation = useCreateSalesReturn();

  // Step 1: Select SO
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [soSearch, setSoSearch] = useState('');

  // Fetch SOs for selection (only confirmed, invoiced, completed)
  const { data: soList, isLoading: isLoadingSOs } = useSalesOrders({
    page: 1,
    pageSize: 20,
    search: soSearch,
  });

  // Fetch selected SO details
  const { data: selectedSO, isLoading: isLoadingSODetails } = useSalesOrder(
    selectedOrderId || '',
  );

  const form = useForm<CreateSalesReturnValues>({
    resolver: zodResolver(createSalesReturnSchema),
    defaultValues: {
      orderId: '',
      returnNumber: '',
      reason: '',
      notes: '',
      refundMethod: 'cash',
      returnToStock: true,
      items: [],
    },
  });

  const { fields, append, remove, replace } = useFieldArray({
    control: form.control,
    name: 'items',
  });

  // Generate return number on mount
  useEffect(() => {
    salesReturnsService.generateReturnNumber().then((returnNumber) => {
      form.setValue('returnNumber', returnNumber);
    });
  }, [form]);

  useEffect(() => {
    if (selectedOrderId) {
      form.setValue('orderId', selectedOrderId);
    }
  }, [selectedOrderId, form]);

  const onSubmit = (data: CreateSalesReturnValues) => {
    createMutation.mutate(data, {
      onSuccess: () => {
        router.push('/sales/returns');
      },
    });
  };

  // Filter valid SOs (only confirmed, invoiced, completed)
  const availableSOs = soList?.data.filter((so) =>
    ['confirmed', 'invoiced', 'completed'].includes(so.status as string),
  );

  const handleSelectSO = (soId: string) => {
    setSelectedOrderId(soId);
    // Reset items when SO changes
    replace([]);
  };

  const handleAddItem = (soItem: any) => {
    // Check if item already added
    const exists = fields.find((f) => f.orderItemId === soItem.id);
    if (exists) {
      toast.error('Item sudah ditambahkan');
      return;
    }

    append({
      orderItemId: soItem.id,
      quantity: 1,
      reason: '',
    });
  };

  if (!selectedOrderId) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Pilih Referensi Sales Order</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Cari nomor SO atau pelanggan..."
                value={soSearch}
                onChange={(e) => setSoSearch(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>No. SO</TableHead>
                  <TableHead>Pelanggan</TableHead>
                  <TableHead>Tanggal</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-[100px]">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoadingSOs ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center">
                      <Loader2 className="mx-auto h-6 w-6 animate-spin text-muted-foreground" />
                    </TableCell>
                  </TableRow>
                ) : availableSOs?.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center">
                      Tidak ada pesanan ditemukan.
                    </TableCell>
                  </TableRow>
                ) : (
                  availableSOs?.map((so) => (
                    <TableRow key={so.id}>
                      <TableCell className="font-medium">
                        {so.orderNumber}
                      </TableCell>
                      <TableCell>{so.customer?.name || 'Umum'}</TableCell>
                      <TableCell>
                        {new Date(so.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{so.status}</Badge>
                      </TableCell>
                      <TableCell>
                        <Button size="sm" onClick={() => handleSelectSO(so.id)}>
                          Pilih <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={() => setSelectedOrderId(null)}
          size="sm"
        >
          Ubah Sales Order
        </Button>
        <div className="text-sm text-muted-foreground">
          SO Terpilih:{' '}
          <span className="font-medium text-foreground">
            {selectedSO?.orderNumber}
          </span>{' '}
          ({selectedSO?.customer?.name || 'Umum'})
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>{t('generalInfo.title')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="returnNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel optional>{t('returnNumber')}</FormLabel>
                      <FormControl>
                        <Input
                          placeholder={t('returnNumberPlaceholder')}
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
                  name="reason"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel required>{t('reason')}</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder={t('reasonPlaceholder')}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="refundMethod"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('refundMethod')}</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value || undefined}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder={t('refundMethodPlaceholder')} />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="cash">Tunai (Cash)</SelectItem>
                            <SelectItem value="transfer">Transfer Bank</SelectItem>
                            <SelectItem value="credit">Kredit</SelectItem>
                            <SelectItem value="exchange">Tukar Barang</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="returnToStock"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 shadow-sm mt-8 h-10">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>{t('returnToStock')}</FormLabel>
                        </div>
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel optional>{t('notes.title')}</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder={t('notes.placeholder')}
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
                <CardTitle>{t('items.description')}</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoadingSODetails ? (
                  <div className="flex justify-center p-4">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                ) : (
                  <div className="rounded-md border h-64 overflow-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>{t('items.product')}</TableHead>
                          <TableHead className="text-right">Qty SO</TableHead>
                          <TableHead className="w-[50px]"></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {selectedSO?.items?.map((item: any) => {
                          const isAdded = fields.some(
                            (f) => f.orderItemId === item.id,
                          );
                          return (
                            <TableRow key={item.id}>
                              <TableCell>
                                <div className="font-medium">
                                  {item.variant?.product?.name}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  {item.variant?.sku}
                                </div>
                              </TableCell>
                              <TableCell className="text-right">
                                {Number(item.quantity)}
                              </TableCell>
                              <TableCell>
                                <Button
                                  type="button"
                                  size="icon"
                                  variant="ghost"
                                  disabled={isAdded || Number(item.quantity) <= 0}
                                  onClick={() => handleAddItem(item)}
                                >
                                  {isAdded ? (
                                    <CheckCircle className="h-4 w-4 text-primary" />
                                  ) : (
                                    <Plus className="h-4 w-4" />
                                  )}
                                </Button>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>{t('items.title')}</CardTitle>
            </CardHeader>
            <CardContent>
              {fields.length === 0 ? (
                <div className="py-8 text-center text-muted-foreground">
                  Belum ada item yang dipilih untuk diretur.
                </div>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>{t('items.product')}</TableHead>
                        <TableHead className="w-[120px]">{t('items.returnQty')}</TableHead>
                        <TableHead className="w-[200px]">{t('items.itemReason')}</TableHead>
                        <TableHead className="w-[50px]"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {fields.map((field, index) => {
                        const soItem = selectedSO?.items?.find(
                          (i: any) => i.id === field.orderItemId,
                        );
                        return (
                          <TableRow key={field.id}>
                            <TableCell>
                              <div className="font-medium">
                                {soItem?.variant?.product?.name}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {soItem?.variant?.sku} (Maks: {soItem?.quantity})
                              </div>
                            </TableCell>
                            <TableCell>
                              <FormField
                                control={form.control}
                                name={`items.${index}.quantity`}
                                render={({ field }) => (
                                  <FormItem>
                                    <FormControl>
                                      <Input
                                        type="number"
                                        min={1}
                                        max={Number(soItem?.quantity || 0)}
                                        {...field}
                                        onChange={(e) =>
                                          field.onChange(Number(e.target.value))
                                        }
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </TableCell>
                            <TableCell>
                              <FormField
                                control={form.control}
                                name={`items.${index}.reason`}
                                render={({ field }) => (
                                  <FormItem>
                                    <FormControl>
                                      <Input
                                        placeholder="Kondisi barang..."
                                        {...field}
                                        value={field.value || ''}
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </TableCell>
                            <TableCell>
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={() => remove(index)}
                              >
                                <Trash className="h-4 w-4 text-destructive" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              )}
              {form.formState.errors.items && (
                <p className="mt-2 text-sm font-medium text-destructive">
                  {form.formState.errors.items.message}
                </p>
              )}
            </CardContent>
          </Card>

          <div className="flex justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              disabled={createMutation.isPending}
            >
              Kembali
            </Button>
            <Button
              type="submit"
              disabled={createMutation.isPending || fields.length === 0}
            >
              {createMutation.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              <Save className="mr-2 h-4 w-4" />
              Buat Retur
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
