'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  createPurchaseReturnSchema,
  CreatePurchaseReturnValues,
  PurchaseOrderStatus,
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
import { useCreatePurchaseReturn } from '@/hooks/use-purchase-returns';
import {
  usePurchaseOrders,
  usePurchaseOrder,
} from '@/hooks/use-purchase-orders';
import { toast } from 'sonner';

import { purchaseReturnsService } from '@/services/purchase-returns.service';

export function PurchaseReturnForm() {
  const router = useRouter();
  const createMutation = useCreatePurchaseReturn();

  // Step 1: Select PO
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [poSearch, setPoSearch] = useState('');

  // Fetch POs for selection (only received or completed)
  const { data: poList, isLoading: isLoadingPOs } = usePurchaseOrders({
    page: 1,
    pageSize: 20,
    search: poSearch,
  });

  // Fetch selected PO details
  const { data: selectedPO, isLoading: isLoadingPODetails } = usePurchaseOrder(
    selectedOrderId || '',
  );

  const form = useForm<CreatePurchaseReturnValues>({
    resolver: zodResolver(createPurchaseReturnSchema),
    defaultValues: {
      orderId: '',
      returnNumber: '',
      reason: '',
      notes: '',
      items: [],
    },
  });

  const { fields, append, remove, replace } = useFieldArray({
    control: form.control,
    name: 'items',
  });

  // Generate return number on mount
  useEffect(() => {
    purchaseReturnsService.generateReturnNumber().then((returnNumber) => {
      form.setValue('returnNumber', returnNumber);
    });
  }, [form]);

  useEffect(() => {
    if (selectedOrderId) {
      form.setValue('orderId', selectedOrderId);
    }
  }, [selectedOrderId, form]);

  const onSubmit = (data: CreatePurchaseReturnValues) => {
    createMutation.mutate(data, {
      onSuccess: () => {
        router.push('/purchases/returns');
      },
    });
  };

  // Filter valid POs (only received or completed)
  const availablePOs = poList?.data.filter((po) =>
    [PurchaseOrderStatus.RECEIVED, PurchaseOrderStatus.COMPLETED].includes(
      po.status as any,
    ),
  );

  const handleSelectPO = (poId: string) => {
    setSelectedOrderId(poId);
    // Reset items when PO changes
    replace([]);
  };

  const handleAddItem = (poItem: any) => {
    // Check if item already added
    const exists = fields.find((f) => f.variantId === poItem.variantId);
    if (exists) {
      toast.error('Item sudah ada di daftar return');
      return;
    }

    append({
      variantId: poItem.variantId,
      quantity: 1,
      reason: '',
    });
  };

  if (!selectedOrderId) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Pilih Purchase Order</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Cari No. PO atau Pemasok..."
                value={poSearch}
                onChange={(e) => setPoSearch(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>No. PO</TableHead>
                  <TableHead>Pemasok</TableHead>
                  <TableHead>Tanggal</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-[100px]">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoadingPOs ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center">
                      <Loader2 className="mx-auto h-6 w-6 animate-spin text-muted-foreground" />
                    </TableCell>
                  </TableRow>
                ) : availablePOs?.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center">
                      Tidak ada PO yang dapat di-return (harus status
                      Received/Completed)
                    </TableCell>
                  </TableRow>
                ) : (
                  availablePOs?.map((po) => (
                    <TableRow key={po.id}>
                      <TableCell className="font-medium">
                        {po.orderNumber}
                      </TableCell>
                      <TableCell>{po.supplier?.name}</TableCell>
                      <TableCell>
                        {new Date(po.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{po.status}</Badge>
                      </TableCell>
                      <TableCell>
                        <Button size="sm" onClick={() => handleSelectPO(po.id)}>
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
          &larr; Ganti PO
        </Button>
        <div className="text-sm text-muted-foreground">
          PO Terpilih:{' '}
          <span className="font-medium text-foreground">
            {selectedPO?.orderNumber}
          </span>{' '}
          ({selectedPO?.supplier?.name})
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Informasi Return</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="returnNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel optional>No. Return</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Otomatis"
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
                      <FormLabel required>Alasan Return</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Contoh: Barang rusak, Salah kirim, dll."
                          {...field}
                        />
                      </FormControl>
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
                <CardTitle>Pilih Barang dari PO</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoadingPODetails ? (
                  <div className="flex justify-center p-4">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                ) : (
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Produk</TableHead>
                          <TableHead className="text-right">Diterima</TableHead>
                          <TableHead className="w-[50px]"></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {selectedPO?.items?.map((item) => {
                          const isAdded = fields.some(
                            (f) => f.variantId === item.variantId,
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
                                {Number(item.receivedQty)}
                              </TableCell>
                              <TableCell>
                                <Button
                                  type="button"
                                  size="icon"
                                  variant="ghost"
                                  disabled={
                                    isAdded || Number(item.receivedQty) <= 0
                                  }
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
              <CardTitle>Barang yang di-Return</CardTitle>
            </CardHeader>
            <CardContent>
              {fields.length === 0 ? (
                <div className="py-8 text-center text-muted-foreground">
                  Belum ada barang yang dipilih. Pilih barang dari daftar PO di
                  atas.
                </div>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Produk</TableHead>
                        <TableHead className="w-[120px]">Qty Return</TableHead>
                        <TableHead className="w-[200px]">
                          Alasan (Opsional)
                        </TableHead>
                        <TableHead className="w-[50px]"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {fields.map((field, index) => {
                        const poItem = selectedPO?.items?.find(
                          (i) => i.variantId === field.variantId,
                        );
                        return (
                          <TableRow key={field.id}>
                            <TableCell>
                              <div className="font-medium">
                                {poItem?.variant?.product?.name}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {poItem?.variant?.sku}
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
                                        max={Number(poItem?.receivedQty || 0)}
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
                                        placeholder="Penyok, dll"
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
              Batal
            </Button>
            <Button
              type="submit"
              disabled={createMutation.isPending || fields.length === 0}
            >
              {createMutation.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              <Save className="mr-2 h-4 w-4" />
              Simpan Return
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
