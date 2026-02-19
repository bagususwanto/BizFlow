'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  createSupplierPaymentSchema,
  CreateSupplierPaymentValues,
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Calendar,
  cn,
  Textarea,
} from '@bizflow/ui';
import { Loader2, Save, CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { id as idLocale } from 'date-fns/locale';
import {
  useCreateSupplierPayment,
  useUpdateSupplierPayment,
  useGeneratePaymentNumber,
} from '@/hooks/use-supplier-payments';
import { useSuppliers } from '@/hooks/use-suppliers';
import { useAccounts } from '@/hooks/use-accounts';
import { usePurchaseOrders } from '@/hooks/use-purchase-orders';
import { toast } from 'sonner';

interface SupplierPaymentFormProps {
  initialData?: any;
}

export function SupplierPaymentForm({ initialData }: SupplierPaymentFormProps) {
  const router = useRouter();
  const createMutation = useCreateSupplierPayment();
  const updateMutation = useUpdateSupplierPayment();

  // Generate payment number
  const { data: generatedNumber, refetch: generateNumber } =
    useGeneratePaymentNumber();

  // Form setup
  const form = useForm<CreateSupplierPaymentValues>({
    resolver: zodResolver(createSupplierPaymentSchema),
    defaultValues: {
      paymentNumber: '',
      supplierId: '',
      purchaseOrderId: '',
      accountId: '',
      paymentDate: new Date().toISOString(),
      amount: 0,
      paymentMethod: 'transfer',
      reference: '',
      notes: '',
      ...initialData,
    },
  });

  // Watchers
  const supplierId = form.watch('supplierId');
  const purchaseOrderId = form.watch('purchaseOrderId');

  // Fetch Data
  const { suppliers, isLoading: isLoadingSuppliers } = useSuppliers({
    page: 1,
    pageSize: 100, // Fetch enough suppliers
  });

  const { data: accountsData, isLoading: isLoadingAccounts } = useAccounts();

  // Fetch POs filtered by supplier (if selected)
  const { data: poData, isLoading: isLoadingPOs } = usePurchaseOrders(
    supplierId
      ? {
          page: 1,
          pageSize: 100,
          supplierId,
          // Only show POs that are NOT fully paid?
          // Ideally backend supports filtering by paymentStatus != 'paid'
          // For now fetching all for supplier
        }
      : { page: 1, pageSize: 0 }, // Don't fetch if no supplier
  );

  // Generate number on mount if not editing
  useEffect(() => {
    if (!initialData) {
      generateNumber();
    }
  }, [generateNumber, initialData]);

  // Set payment number when generated
  useEffect(() => {
    if (generatedNumber && !initialData) {
      form.setValue('paymentNumber', generatedNumber);
    }
  }, [generatedNumber, form, initialData]);

  // Handle PO Selection to auto-fill amount
  useEffect(() => {
    if (purchaseOrderId && poData?.data) {
      const selectedPO = poData.data.find((po) => po.id === purchaseOrderId);
      if (selectedPO) {
        // Auto fill amount with remaining balance (total - paid)
        // Ensure we handle string/number conversion if needed
        const total = Number(selectedPO.total);
        const paid = Number(selectedPO.paidAmount || 0);
        const remaining = total - paid;
        if (remaining > 0) {
          form.setValue('amount', remaining);
        }
      }
    }
  }, [purchaseOrderId, poData, form]);

  const onSubmit = (data: CreateSupplierPaymentValues) => {
    if (initialData?.id) {
      updateMutation.mutate(
        { id: initialData.id, data },
        {
          onSuccess: () => {
            router.push('/purchases/payments');
          },
        },
      );
    } else {
      createMutation.mutate(data, {
        onSuccess: () => {
          router.push('/purchases/payments');
        },
      });
    }
  };

  const accounts = accountsData || []; // Accounts is array directly based on my service
  const purchaseOrders = poData?.data || [];

  // Filter POs to show only unpaid/partial
  const availablePOs = purchaseOrders.filter(
    (po) => po.paymentStatus !== 'paid',
  );

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Informasi Pembayaran</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-6 md:grid-cols-2">
            {/* Payment Number */}
            <FormField
              control={form.control}
              name="paymentNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>No. Pembayaran</FormLabel>
                  <FormControl>
                    <Input placeholder="Otomatis" {...field} readOnly />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Date */}
            <FormField
              control={form.control}
              name="paymentDate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel required>Tanggal Pembayaran</FormLabel>
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
                            format(new Date(field.value), 'dd MMMM yyyy', {
                              locale: idLocale,
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
                        onSelect={(date) =>
                          field.onChange(date ? date.toISOString() : '')
                        }
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

            {/* Supplier */}
            <FormField
              control={form.control}
              name="supplierId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel required>Pemasok</FormLabel>
                  <Select
                    onValueChange={(val) => {
                      field.onChange(val);
                      form.setValue('purchaseOrderId', ''); // Reset PO
                    }}
                    defaultValue={field.value}
                    disabled={isLoadingSuppliers}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih pemasok" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {suppliers.map((supplier) => (
                        <SelectItem key={supplier.id} value={supplier.id}>
                          {supplier.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Purchase Order (Optional but filtered by Supplier) */}
            <FormField
              control={form.control}
              name="purchaseOrderId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel optional>Purchase Order</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value || undefined}
                    disabled={!supplierId || isLoadingPOs}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue
                          placeholder={
                            supplierId
                              ? 'Pilih PO (Opsional)'
                              : 'Pilih Pemasok Dulu'
                          }
                        />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="unlinked">-- Tanpa PO --</SelectItem>
                      {availablePOs.map((po) => (
                        <SelectItem key={po.id} value={po.id}>
                          {po.orderNumber} (Sisa:{' '}
                          {Number(po.total) - Number(po.paidAmount || 0)})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Account */}
            <FormField
              control={form.control}
              name="accountId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel required>Akun Keuangan</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    disabled={isLoadingAccounts}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih akun bayar" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {accounts.map((acc) => (
                        <SelectItem key={acc.id} value={acc.id}>
                          {acc.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Payment Method */}
            <FormField
              control={form.control}
              name="paymentMethod"
              render={({ field }) => (
                <FormItem>
                  <FormLabel required>Metode Pembayaran</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih metode" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="cash">Tunai</SelectItem>
                      <SelectItem value="transfer">Transfer Bank</SelectItem>
                      <SelectItem value="cheque">Cek / Giro</SelectItem>
                      <SelectItem value="qris">QRIS</SelectItem>
                      <SelectItem value="credit_card">Kartu Kredit</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Amount */}
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel required>Jumlah Bayar</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={0}
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Reference */}
            <FormField
              control={form.control}
              name="reference"
              render={({ field }) => (
                <FormItem>
                  <FormLabel optional>No. Referensi / Bukti</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Contoh: 123456789"
                      {...field}
                      value={field.value || ''}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Notes */}
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem className="md:col-span-2">
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

        <div className="flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={createMutation.isPending || updateMutation.isPending}
          >
            Batal
          </Button>
          <Button
            type="submit"
            disabled={createMutation.isPending || updateMutation.isPending}
          >
            {(createMutation.isPending || updateMutation.isPending) && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            <Save className="mr-2 h-4 w-4" />
            {initialData ? 'Simpan Perubahan' : 'Simpan Pembayaran'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
