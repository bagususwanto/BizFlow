'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  createCustomerPaymentSchema,
  CreateCustomerPaymentValues,
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
  useCreateCustomerPayment,
  useUpdateCustomerPayment,
  useGenerateCustomerPaymentNumber,
} from '@/hooks/use-customer-payments';
import { useCustomers } from '@/hooks/use-customers';
import { useAccounts } from '@/hooks/use-accounts';
import { useSalesInvoices } from '@/hooks/use-sales-invoices';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';

interface CustomerPaymentFormProps {
  initialData?: any;
}

export function CustomerPaymentForm({ initialData }: CustomerPaymentFormProps) {
  const t = useTranslations('sales.payments.form');
  const router = useRouter();
  const createMutation = useCreateCustomerPayment();
  const updateMutation = useUpdateCustomerPayment();

  // Generate payment number
  const { data: generatedNumber, refetch: generateNumber } =
    useGenerateCustomerPaymentNumber();

  // Form setup
  const form = useForm<CreateCustomerPaymentValues>({
    resolver: zodResolver(createCustomerPaymentSchema),
    defaultValues: {
      paymentNumber: '',
      customerId: '',
      invoiceId: '',
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
  const customerId = form.watch('customerId');
  const invoiceId = form.watch('invoiceId');

  // Fetch Data
  const { customers, isLoading: isLoadingCustomers } = useCustomers({
    page: 1,
    pageSize: 100, // Fetch enough customers
  });

  const { data: accountsData, isLoading: isLoadingAccounts } = useAccounts();

  // Fetch Invoices filtered by customer (if selected)
  const { data: invoiceData, isLoading: isLoadingInvoices } = useSalesInvoices(
    customerId
      ? {
          page: 1,
          pageSize: 100,
          customerId,
        }
      : { page: 1, pageSize: 0 }, // Don't fetch if no customer
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

  // Handle Invoice Selection to auto-fill amount
  useEffect(() => {
    if (invoiceId && invoiceData?.data) {
      const selectedInvoice = invoiceData.data.find((inv: any) => inv.id === invoiceId);
      if (selectedInvoice) {
        // Auto fill amount with remaining balance (total - paid)
        const total = Number(selectedInvoice.total);
        const paid = Number(selectedInvoice.paidAmount || 0);
        const remaining = total - paid;
        if (remaining > 0) {
          form.setValue('amount', remaining);
        }
      }
    }
  }, [invoiceId, invoiceData, form]);

  const onSubmit = (data: CreateCustomerPaymentValues) => {
    if (initialData?.id) {
      updateMutation.mutate(
        { id: initialData.id, data },
        {
          onSuccess: () => {
            router.push('/sales/payments');
          },
        },
      );
    } else {
      createMutation.mutate(data, {
        onSuccess: () => {
          router.push('/sales/payments');
        },
      });
    }
  };

  const accounts = accountsData || [];
  const invoices = invoiceData?.data || [];

  // Filter invoices to show only unpaid/partial OR the currently selected invoice
  const availableInvoices = invoices.filter(
    (inv: any) => inv.paymentStatus !== 'paid' || inv.id === invoiceId,
  );

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>{t('title')}</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-6 md:grid-cols-2">
            {/* Payment Number */}
            <FormField
              control={form.control}
              name="paymentNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('paymentNumber.label')}</FormLabel>
                  <FormControl>
                    <Input
                      placeholder={t('paymentNumber.placeholder')}
                      {...field}
                      readOnly
                    />
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
                  <FormLabel required>{t('paymentDate.label')}</FormLabel>
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
                            <span>{t('paymentDate.placeholder')}</span>
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

            {/* Customer */}
            <FormField
              control={form.control}
              name="customerId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel required>{t('customerId.label')}</FormLabel>
                  <Select
                    onValueChange={(val) => {
                      field.onChange(val);
                      form.setValue('invoiceId', ''); // Reset Invoice
                    }}
                    defaultValue={field.value || undefined}
                    disabled={isLoadingCustomers}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue
                          placeholder={t('customerId.placeholder')}
                        />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {customers.map((customer: any) => (
                        <SelectItem key={customer.id} value={customer.id}>
                          {customer.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Invoice (Optional but filtered by Customer) */}
            <FormField
              control={form.control}
              name="invoiceId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel optional>{t('invoiceId.label')}</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value || undefined}
                    disabled={!customerId || isLoadingInvoices}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue
                          placeholder={
                            customerId
                              ? t('invoiceId.placeholder')
                              : t('invoiceId.placeholderDisabled')
                          }
                        />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="unlinked">
                        {t('invoiceId.noInvoice')}
                      </SelectItem>
                      {availableInvoices.map((inv: any) => (
                        <SelectItem key={inv.id} value={inv.id}>
                          {inv.invoiceNumber} ({t('invoiceId.remaining')}{' '}
                          {Number(inv.total) - Number(inv.paidAmount || 0)})
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
                  <FormLabel required>{t('accountId.label')}</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    disabled={isLoadingAccounts}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={t('accountId.placeholder')} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {accounts.map((acc: any) => (
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
                  <FormLabel required>{t('paymentMethod.label')}</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue
                          placeholder={t('paymentMethod.placeholder')}
                        />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="cash">
                        {t('paymentMethod.options.cash')}
                      </SelectItem>
                      <SelectItem value="transfer">
                        {t('paymentMethod.options.transfer')}
                      </SelectItem>
                      <SelectItem value="qris">
                        {t('paymentMethod.options.qris')}
                      </SelectItem>
                      <SelectItem value="credit">
                        {t('paymentMethod.options.credit')}
                      </SelectItem>
                      <SelectItem value="debit">
                        {t('paymentMethod.options.debit')}
                      </SelectItem>
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
                  <FormLabel required>{t('amount.label')}</FormLabel>
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
                  <FormLabel optional>{t('reference.label')}</FormLabel>
                  <FormControl>
                    <Input
                      placeholder={t('reference.placeholder')}
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
                  <FormLabel optional>{t('notes.label')}</FormLabel>
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

        <div className="flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={createMutation.isPending || updateMutation.isPending}
          >
            {t('actions.cancel')}
          </Button>
          <Button
            type="submit"
            disabled={createMutation.isPending || updateMutation.isPending}
          >
            {(createMutation.isPending || updateMutation.isPending) && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            {!(createMutation.isPending || updateMutation.isPending) && (
              <Save className="mr-2 h-4 w-4" />
            )}
            {initialData
              ? t('actions.submitUpdate')
              : t('actions.submitCreate')}
          </Button>
        </div>
      </form>
    </Form>
  );
}
