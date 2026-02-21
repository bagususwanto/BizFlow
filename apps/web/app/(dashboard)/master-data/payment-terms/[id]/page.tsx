'use client';

import { use } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@bizflow/ui';
import { PaymentTermForm } from '@/components/master-data/payment-terms/payment-term-form';
import { usePaymentTerm } from '@/hooks/master-data/use-payment-terms';
import { useBreadcrumb } from '@/contexts/breadcrumb-context';
import { LoadingState } from '@/components/common/loading-state';
import { ErrorState } from '@/components/common/error-state';

export default function EditPaymentTermPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const {
    data: paymentTerm,
    isLoading,
    isError,
    refetch,
  } = usePaymentTerm(resolvedParams.id);

  // Set dynamic breadcrumb
  useBreadcrumb(
    `/master-data/payment-terms/${resolvedParams.id}`,
    paymentTerm?.name || 'Edit Termin Pembayaran',
  );

  if (isLoading) {
    return (
      <div className="flex justify-center p-8">
        <LoadingState />
      </div>
    );
  }

  if (isError || !paymentTerm) {
    return (
      <ErrorState
        title="Gagal memuat detail termin pembayaran"
        onRetry={() => refetch()}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">
          Edit Termin Pembayaran
        </h2>
        <p className="text-muted-foreground">
          Ubah informasi termin pembayaran {paymentTerm.name}.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Edit Informasi Termin Pembayaran</CardTitle>
          <CardDescription>
            Lakukan perubahan pada data termin pembayaran.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <PaymentTermForm initialData={paymentTerm} isEdit />
        </CardContent>
      </Card>
    </div>
  );
}
