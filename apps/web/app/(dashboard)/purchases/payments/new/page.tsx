'use client';

import { Suspense } from 'react';
import { Loader2 } from 'lucide-react';
import { SupplierPaymentForm } from '@/components/purchases/payments/supplier-payment-form';
import { useBreadcrumb } from '@/contexts/breadcrumb-context';

import { useTranslations } from 'next-intl';

export default function CreateSupplierPaymentPage() {
  const t = useTranslations('purchases.payments.create');
  useBreadcrumb('/purchases/payments/new', t('breadcrumb'));

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">{t('title')}</h2>
        <p className="text-muted-foreground">{t('description')}</p>
      </div>

      <Suspense
        fallback={
          <div className="flex justify-center p-8">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        }
      >
        <SupplierPaymentForm />
      </Suspense>
    </div>
  );
}
