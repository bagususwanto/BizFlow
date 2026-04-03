'use client';

import { use } from 'react';
import { CustomerPaymentForm } from '@/components/sales/payments/customer-payment-form';
import { useTranslations } from 'next-intl';
import { useBreadcrumb } from '@/contexts/breadcrumb-context';

export default function NewCustomerPaymentPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const resolvedParams = use(searchParams);
  const invoiceId = resolvedParams?.invoiceId as string;
  const customerId = resolvedParams?.customerId as string;
  const amount = resolvedParams?.amount ? Number(resolvedParams.amount) : undefined;
  const t = useTranslations('sales.payments');

  useBreadcrumb('/sales/payments/new', t('actions.createBtn') || 'Buat Pembayaran');

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">
          {t('form.createTitle') || 'Buat Pembayaran Pelanggan'}
        </h2>
        <p className="text-muted-foreground">
          {t('form.createSubtitle') || 'Catat penerimaan pembayaran dari pelanggan.'}
        </p>
      </div>
      <CustomerPaymentForm
        initialData={{
          ...(invoiceId ? { invoiceId } : {}),
          ...(customerId ? { customerId } : {}),
          ...(amount ? { amount } : {}),
        }}
      />
    </div>
  );
}
