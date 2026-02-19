'use client';

import { use } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supplierPaymentsService } from '@/services/supplier-payments.service';
import { SupplierPaymentForm } from '@/components/purchases/payments/supplier-payment-form';

import { useBreadcrumb } from '@/contexts/breadcrumb-context';
import { LoadingState } from '@/components/common/loading-state';
import { ErrorState } from '@/components/common/error-state';

export default function EditSupplierPaymentPage({
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
    queryKey: ['supplier-payments', resolvedParams.id],
    queryFn: () => supplierPaymentsService.getById(resolvedParams.id),
  });

  useBreadcrumb(
    `/purchases/payments/${resolvedParams.id}`,
    payment?.paymentNumber || 'Detail Pembayaran',
  );

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
    supplierId: payment.supplierId,
    purchaseOrderId: payment.purchaseOrderId || '',
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

      <SupplierPaymentForm initialData={initialData} />
    </div>
  );
}
