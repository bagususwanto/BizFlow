'use client';

import { usePaymentTerm } from '@/hooks/master-data/use-payment-terms';
import { PaymentTermForm } from '@/components/master-data/payment-terms/payment-term-form';
import { ErrorState } from '@/components/common/error-state';
import { Loader2 } from 'lucide-react';

export default function EditPaymentTermPage({
  params,
}: {
  params: { id: string };
}) {
  const {
    data: paymentTerm,
    isLoading,
    isError,
    refetch,
  } = usePaymentTerm(params.id);

  if (isLoading) {
    return <PaymentTermFormSkeleton />;
  }

  if (isError || !paymentTerm) {
    return (
      <ErrorState
        title="Termin pembayaran tidak ditemukan"
        message="Data termin pembayaran yang Anda cari tidak ada atau terjadi kesalahan."
        onRetry={() => refetch()}
      />
    );
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            Edit Termin Pembayaran
          </h2>
          <p className="text-muted-foreground">
            Edit data termin {paymentTerm.name}
          </p>
        </div>
      </div>

      <div className="max-w-3xl">
        <PaymentTermForm initialData={paymentTerm} isEdit />
      </div>
    </div>
  );
}

function PaymentTermFormSkeleton() {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center space-x-4">
        <div className="h-8 w-8 rounded-full bg-muted animate-pulse" />
        <div className="space-y-2">
          <div className="h-6 w-48 bg-muted animate-pulse rounded" />
          <div className="h-4 w-64 bg-muted animate-pulse rounded" />
        </div>
      </div>
      <div className="max-w-3xl mt-8 flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    </div>
  );
}
