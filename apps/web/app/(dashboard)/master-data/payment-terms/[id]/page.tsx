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
import { useTranslations } from 'next-intl';

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
  const t = useTranslations('paymentTerms');

  // Set dynamic breadcrumb
  useBreadcrumb(
    `/master-data/payment-terms/${resolvedParams.id}`,
    paymentTerm?.name || t('edit.title'),
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
      <ErrorState title={t('edit.failedLoad')} onRetry={() => refetch()} />
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">{t('edit.title')}</h2>
        <p className="text-muted-foreground">
          {t('edit.subtitle', { name: paymentTerm.name })}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t('edit.cardTitle')}</CardTitle>
          <CardDescription>{t('edit.cardDesc')}</CardDescription>
        </CardHeader>
        <CardContent>
          <PaymentTermForm initialData={paymentTerm} isEdit />
        </CardContent>
      </Card>
    </div>
  );
}
