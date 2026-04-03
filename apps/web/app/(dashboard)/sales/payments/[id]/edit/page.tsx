'use client';

import { use } from 'react';
import { useQuery } from '@tanstack/react-query';
import { customerPaymentsService } from '@/services/customer-payments.service';
import { CustomerPaymentForm } from '@/components/sales/payments/customer-payment-form';

import { useBreadcrumb } from '@/contexts/breadcrumb-context';
import { LoadingState } from '@/components/common/loading-state';
import { ErrorState } from '@/components/common/error-state';

export default function EditCustomerPaymentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const {
    data: payment,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ['customer-payments', resolvedParams.id],
    queryFn: () => customerPaymentsService.getById(resolvedParams.id),
  });

  useBreadcrumb(
    `/sales/payments/${resolvedParams.id}`,
    payment?.paymentNumber || 'Detail Pembayaran',
  );
  useBreadcrumb(`/sales/payments/${resolvedParams.id}/edit`, 'Edit Pembayaran');

  if (isLoading) {
    return (
      <div className="flex justify-center p-8">
        <LoadingState />
      </div>
    );
  }

  if (isError || !payment) {
    return (
      <ErrorState
        title="Gagal memuat detail pembayaran"
        onRetry={() => refetch()}
      />
    );
  }

  // Transform data for form
  const initialData = {
    ...payment,
    customerId: payment.customerId,
    invoiceId: payment.invoiceId || '',
    accountId: payment.accountId,
    paymentDate: payment.paymentDate,
    amount: Number(payment.amount),
    paymentMethod: payment.paymentMethod,
    reference: payment.reference || '',
    notes: payment.notes || '',
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Edit Pembayaran</h2>
        <p className="text-muted-foreground">
          Edit detail pembayaran: {payment.paymentNumber}
        </p>
      </div>

      <CustomerPaymentForm initialData={initialData} />
    </div>
  );
}
